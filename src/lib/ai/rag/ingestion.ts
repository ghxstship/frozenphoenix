/* ═══════════════════════════════════════════════════════════════
   AI Copilot — RAG Document Ingestion Pipeline
   
   End-to-end pipeline for processing uploaded documents:
   1. Extract text from file buffer
   2. Chunk the extracted text
   3. Generate embeddings for each chunk
   4. Persist document record + chunks to the database
   
   Orchestrates extractors → chunker → embedder → DB writes.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/server";
import type { AIDocument, DocumentSourceType } from "../types";
import { chunkDocument } from "./chunker";
import { embedBatch } from "./embedder";
import { extractText, isSupportedMimeType } from "./extractors";

// ─── Types ───────────────────────────────────────────────────

export interface IngestionParams {
    /** File buffer to process */
    fileBuffer: Buffer;
    /** MIME type of the file */
    mimeType: string;
    /** Original filename */
    fileName: string;
    /** Organization ID */
    orgId: string;
    /** User who uploaded */
    uploadedBy: string;
    /** Source type classification */
    sourceType: DocumentSourceType;
    /** Optional Supabase storage path */
    storagePath?: string;
}

export interface IngestionResult {
    documentId: string;
    chunkCount: number;
    totalTokens: number;
    status: "ready" | "failed";
    error?: string;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Ingest a document through the full RAG pipeline.
 * Creates the document record, extracts text, chunks, embeds, and persists.
 */
export async function ingestDocument(params: IngestionParams): Promise<IngestionResult> {
    const supabase = createAdminClient();
    if (!supabase) {
        return {
            documentId: "",
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: "Database connection not configured",
        };
    }

    // Validate MIME type
    if (!isSupportedMimeType(params.mimeType)) {
        return {
            documentId: "",
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: `Unsupported file type: ${params.mimeType}`,
        };
    }

    // 1. Create document record with "processing" status
    const { data: doc, error: docError } = await supabase
        .from("ai_documents")
        .insert({
            org_id: params.orgId,
            title: params.fileName,
            source_type: params.sourceType,
            file_name: params.fileName,
            file_size: params.fileBuffer.length,
            mime_type: params.mimeType,
            storage_path: params.storagePath ?? "",
            processing_status: "processing",
            uploaded_by: params.uploadedBy,
        })
        .select()
        .single();

    if (docError || !doc) {
        logger.error("Failed to create document record", { error: docError?.message });
        return {
            documentId: "",
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: `Failed to create document: ${docError?.message}`,
        };
    }

    const documentId = (doc as AIDocument).id;

    try {
        // 2. Extract text
        logger.info("Extracting text from document", { documentId, mimeType: params.mimeType });
        const extraction = await extractText(params.fileBuffer, params.mimeType);

        if (!extraction.text || extraction.text.trim().length === 0) {
            await updateDocumentStatus(supabase, documentId, "failed");
            return {
                documentId,
                chunkCount: 0,
                totalTokens: 0,
                status: "failed",
                error: "No text content could be extracted from the file",
            };
        }

        // 3. Chunk the text
        logger.info("Chunking document", { documentId, textLength: extraction.text.length });
        const chunks = chunkDocument(extraction.text);

        if (chunks.length === 0) {
            await updateDocumentStatus(supabase, documentId, "failed");
            return {
                documentId,
                chunkCount: 0,
                totalTokens: 0,
                status: "failed",
                error: "Document produced no chunks after processing",
            };
        }

        // 4. Generate embeddings
        logger.info("Generating embeddings", { documentId, chunkCount: chunks.length });
        let embeddings: number[][] = [];
        let embeddingTokens = 0;

        try {
            const embedResult = await embedBatch(chunks.map((c) => c.content));
            embeddings = embedResult.embeddings;
            embeddingTokens = embedResult.totalTokens;
        } catch (embedError) {
            logger.warn("Embedding generation failed — storing chunks without vectors", {
                documentId,
                error: embedError instanceof Error ? embedError.message : String(embedError),
            });
            // Continue without embeddings — text search will still work
        }

        // 5. Persist chunks to database
        logger.info("Persisting chunks", { documentId, chunkCount: chunks.length });

        const chunkRows = chunks.map((chunk, i) => ({
            document_id: documentId,
            chunk_index: chunk.index,
            content: chunk.content,
            token_count: chunk.tokenEstimate,
            embedding: embeddings[i] ? JSON.stringify(embeddings[i]) : null,
            metadata: {
                ...chunk.metadata,
                page_count: extraction.pageCount,
            },
        }));

        // Insert in batches of 50 to avoid payload limits
        const BATCH_SIZE = 50;
        let insertedCount = 0;

        for (let i = 0; i < chunkRows.length; i += BATCH_SIZE) {
            const batch = chunkRows.slice(i, i + BATCH_SIZE);
            const { error: insertError } = await supabase.from("ai_document_chunks").insert(batch);

            if (insertError) {
                logger.error("Chunk insert batch failed", {
                    documentId,
                    batchIndex: i,
                    error: insertError.message,
                });
            } else {
                insertedCount += batch.length;
            }
        }

        // 6. Update document status and token count
        const totalTokens = chunks.reduce((sum, c) => sum + c.tokenEstimate, 0);

        await supabase
            .from("ai_documents")
            .update({
                processing_status: "ready",
                chunk_count: insertedCount,
                total_tokens: totalTokens,
            })
            .eq("id", documentId);

        logger.info("Document ingestion complete", {
            documentId,
            chunkCount: insertedCount,
            totalTokens,
            embeddingTokens,
        });

        return {
            documentId,
            chunkCount: insertedCount,
            totalTokens,
            status: "ready",
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("Document ingestion pipeline failed", { documentId, error: message });

        await updateDocumentStatus(supabase, documentId, "failed");

        return {
            documentId,
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: message,
        };
    }
}

// ─── Re-Ingestion ────────────────────────────────────────────

/**
 * Re-process an existing document (e.g., after embedding model change).
 * Deletes existing chunks and re-runs the pipeline.
 */
export async function reIngestDocument(
    documentId: string,
    fileBuffer: Buffer,
    mimeType: string
): Promise<IngestionResult> {
    const supabase = createAdminClient();
    if (!supabase) {
        return {
            documentId,
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: "No DB connection",
        };
    }

    // Get existing document
    const { data: doc } = await supabase
        .from("ai_documents")
        .select("*")
        .eq("id", documentId)
        .single();

    if (!doc) {
        return {
            documentId,
            chunkCount: 0,
            totalTokens: 0,
            status: "failed",
            error: "Document not found",
        };
    }

    // Delete existing chunks
    await supabase.from("ai_document_chunks").delete().eq("document_id", documentId);

    // Update status to processing
    await updateDocumentStatus(supabase, documentId, "processing");

    // Re-run ingestion
    return ingestDocument({
        fileBuffer,
        mimeType,
        fileName: doc.file_name,
        orgId: doc.org_id,
        uploadedBy: doc.uploaded_by,
        sourceType: doc.source_type,
        storagePath: doc.storage_path,
    });
}

// ─── Helpers ─────────────────────────────────────────────────

async function updateDocumentStatus(
    supabase: NonNullable<ReturnType<typeof createAdminClient>>,
    documentId: string,
    status: string
): Promise<void> {
    await supabase.from("ai_documents").update({ processing_status: status }).eq("id", documentId);
}
