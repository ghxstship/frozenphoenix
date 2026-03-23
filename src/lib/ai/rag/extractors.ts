/* ═══════════════════════════════════════════════════════════════
   AI Copilot — RAG Document Text Extractors
   
   Extracts plain text from uploaded files for chunking/embedding.
   Supports: PDF, DOCX, XLSX, TXT, MD, HTML, CSV.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────

export interface ExtractionResult {
    text: string;
    pageCount?: number | undefined;
    metadata: Record<string, unknown>;
}

// ─── Supported MIME Types ────────────────────────────────────

const EXTRACTORS: Record<string, (buffer: Buffer) => Promise<ExtractionResult>> = {
    "application/pdf": extractPdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extractDocx,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": extractXlsx,
    "text/plain": extractPlainText,
    "text/markdown": extractPlainText,
    "text/csv": extractPlainText,
    "text/html": extractHtml,
};

/**
 * Check if a MIME type is supported for text extraction.
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return mimeType in EXTRACTORS;
}

/**
 * Get list of supported MIME types.
 */
export function getSupportedMimeTypes(): string[] {
    return Object.keys(EXTRACTORS);
}

/**
 * Extract text from a file buffer based on its MIME type.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
    const extractor = EXTRACTORS[mimeType];

    if (!extractor) {
        throw new Error(
            `Unsupported file type: ${mimeType}. ` +
                `Supported types: ${getSupportedMimeTypes().join(", ")}`
        );
    }

    try {
        return await extractor(buffer);
    } catch (error) {
        logger.error("Text extraction failed", {
            mimeType,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
            `Failed to extract text from ${mimeType}: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

// ─── PDF Extractor ───────────────────────────────────────────

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
    // Dynamic import to avoid bundling in client
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (
        pdfParseModule as unknown as {
            default: (
                buf: Buffer
            ) => Promise<{ text: string; numpages: number; info?: Record<string, string> }>;
        }
    ).default;

    const result = await pdfParse(buffer);

    return {
        text: result.text,
        pageCount: result.numpages,
        metadata: {
            title: result.info?.Title,
            author: result.info?.Author,
            creator: result.info?.Creator,
        },
    };
}

// ─── DOCX Extractor ──────────────────────────────────────────

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
    const mammoth = await import("mammoth");

    const result = await mammoth.extractRawText({ buffer });

    return {
        text: result.value,
        metadata: {
            warnings: result.messages.length,
        },
    };
}

// ─── XLSX Extractor ──────────────────────────────────────────

async function extractXlsx(buffer: Buffer): Promise<ExtractionResult> {
    const XLSX = await import("xlsx");

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheets: string[] = [];

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const csv = XLSX.utils.sheet_to_csv(sheet);
        sheets.push(`## Sheet: ${sheetName}\n${csv}`);
    }

    return {
        text: sheets.join("\n\n"),
        metadata: {
            sheetCount: workbook.SheetNames.length,
            sheetNames: workbook.SheetNames,
        },
    };
}

// ─── Plain Text Extractor ────────────────────────────────────

async function extractPlainText(buffer: Buffer): Promise<ExtractionResult> {
    return {
        text: buffer.toString("utf-8"),
        metadata: {},
    };
}

// ─── HTML Extractor ──────────────────────────────────────────

async function extractHtml(buffer: Buffer): Promise<ExtractionResult> {
    const html = buffer.toString("utf-8");

    // Simple HTML tag stripping (no external dependency)
    const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

    return {
        text,
        metadata: { originalFormat: "html" },
    };
}
