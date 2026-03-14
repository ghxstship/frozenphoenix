/* ═══════════════════════════════════════════════════════════════
   AI Copilot — RAG Context Retriever
   
   Retrieves relevant document chunks for a query using:
   1. Vector similarity search (pgvector cosine distance)
   2. Optional metadata filters (source type, document ID)
   3. Score threshold and top-k limits
   
   Falls back to text search when embeddings are unavailable.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/server";
import type { DocumentSourceType, RankedChunk } from "../types";
import { embedText } from "./embedder";

// ─── Types ───────────────────────────────────────────────────

export interface RetrievalOptions {
    /** Maximum chunks to return. Default: 5. */
    topK?: number;
    /** Minimum similarity score (0–1). Default: 0.3. */
    scoreThreshold?: number;
    /** Filter by document source types. */
    sourceTypes?: DocumentSourceType[];
    /** Filter by specific document IDs. */
    documentIds?: string[];
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Retrieve the most relevant document chunks for a query.
 * Uses vector similarity search with pgvector when available,
 * falling back to text search.
 */
export async function retrieveContext(
    query: string,
    orgId: string,
    options?: RetrievalOptions
): Promise<RankedChunk[]> {
    const topK = options?.topK ?? 5;
    const scoreThreshold = options?.scoreThreshold ?? 0.3;

    try {
        return await vectorSearch(query, orgId, topK, scoreThreshold, options);
    } catch (error) {
        logger.warn("Vector search failed, falling back to text search", {
            error: error instanceof Error ? error.message : String(error),
        });
        return textFallbackSearch(query, orgId, topK, options);
    }
}

// ─── Vector Search ───────────────────────────────────────────

async function vectorSearch(
    query: string,
    orgId: string,
    topK: number,
    scoreThreshold: number,
    options?: RetrievalOptions
): Promise<RankedChunk[]> {
    const supabase = createAdminClient();
    if (!supabase) return [];

    // Generate query embedding
    const embeddingResult = await embedText(query);
    const queryEmbedding = embeddingResult.embedding;

    // Build the RPC call for vector similarity search
    // Uses a raw SQL query via Supabase RPC since the pgvector
    // cosine distance operator isn't in the PostgREST query builder
    const { data, error } = await supabase.rpc("match_document_chunks", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: topK,
        match_threshold: scoreThreshold,
        filter_org_id: orgId,
        filter_source_types: options?.sourceTypes ?? null,
        filter_document_ids: options?.documentIds ?? null,
    });

    if (error) {
        logger.error("Vector search RPC failed", { error: error.message });
        throw error;
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((row: Record<string, unknown>) => ({
        chunk: {
            id: String(row.chunk_id ?? ""),
            document_id: String(row.document_id ?? ""),
            chunk_index: Number(row.chunk_index ?? 0),
            content: String(row.content ?? ""),
            token_count: Number(row.token_count ?? 0),
            metadata: (row.metadata ?? {}) as RankedChunk["chunk"]["metadata"],
            created_at: String(row.created_at ?? ""),
        },
        score: Number(row.similarity ?? 0),
        document_title: String(row.document_title ?? ""),
        document_source_type: String(row.source_type ?? "upload") as DocumentSourceType,
    }));
}

// ─── Text Fallback Search ────────────────────────────────────

async function textFallbackSearch(
    query: string,
    orgId: string,
    topK: number,
    options?: RetrievalOptions
): Promise<RankedChunk[]> {
    const supabase = createAdminClient();
    if (!supabase) return [];

    // Get org document IDs
    let docQuery = supabase
        .from("ai_documents")
        .select("id, title, source_type")
        .eq("org_id", orgId)
        .eq("processing_status", "ready");

    if (options?.sourceTypes?.length) {
        docQuery = docQuery.in("source_type", options.sourceTypes);
    }
    if (options?.documentIds?.length) {
        docQuery = docQuery.in("id", options.documentIds);
    }

    const { data: docs } = await docQuery;
    if (!docs || docs.length === 0) return [];

    const docMap = new Map(docs.map((d) => [d.id, d]));
    const docIds = docs.map((d) => d.id);

    // Text search on chunk content
    const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 5);

    if (keywords.length === 0) return [];

    // Search using ilike for each keyword, union approach
    const searchPattern = keywords.map((k) => `%${k}%`).join("%");

    const { data: chunks, error } = await supabase
        .from("ai_document_chunks")
        .select("id, document_id, chunk_index, content, token_count, metadata, created_at")
        .in("document_id", docIds)
        .ilike("content", searchPattern)
        .limit(topK);

    if (error || !chunks) return [];

    return chunks
        .map((chunk) => {
            const doc = docMap.get(chunk.document_id);
            // Simple keyword-frequency scoring
            const lowerContent = chunk.content.toLowerCase();
            const hitCount = keywords.filter((k) => lowerContent.includes(k)).length;
            const score = hitCount / keywords.length;

            return {
                chunk: {
                    id: chunk.id,
                    document_id: chunk.document_id,
                    chunk_index: chunk.chunk_index,
                    content: chunk.content,
                    token_count: chunk.token_count,
                    metadata: (chunk.metadata ?? {}) as RankedChunk["chunk"]["metadata"],
                    created_at: chunk.created_at,
                },
                score,
                document_title: doc?.title ?? "Unknown",
                document_source_type: (doc?.source_type ?? "upload") as DocumentSourceType,
            };
        })
        .sort((a, b) => b.score - a.score);
}

/**
 * Format ranked chunks into text snippets for system prompt injection.
 */
export function formatChunksForPrompt(chunks: RankedChunk[]): string[] {
    return chunks.map((c) => {
        const header = c.chunk.metadata.section_header
            ? `[${c.document_title} > ${c.chunk.metadata.section_header}]`
            : `[${c.document_title}]`;
        return `${header}\n${c.chunk.content}`;
    });
}
