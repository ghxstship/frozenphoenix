/* ═══════════════════════════════════════════════════════════════
   AI Copilot — RAG Document Chunker
   
   Splits extracted text into chunks suitable for embedding.
   Supports two strategies:
   1. Fixed-size — predictable token-budget chunks
   2. Section-aware — splits on markdown headings/paragraph breaks
   
   Overlap ensures context continuity across chunk boundaries.
   ═══════════════════════════════════════════════════════════════ */

// ─── Types ───────────────────────────────────────────────────

export interface ChunkOptions {
    /** Target chunk size in characters. Default: 1500 (~375 tokens). */
    chunkSize?:
        | number
        | undefined; /** Overlap between consecutive chunks in characters. Default: 200. */
    overlap?: number | undefined; /** Chunking strategy. Default: "section_aware". */
    strategy?: "fixed_size" | "section_aware" | undefined;
}

export interface DocumentChunk {
    content: string;
    index: number;
    tokenEstimate: number;
    metadata: {
        page_number?: number | undefined;
        section_header?: string | undefined;
        source_context?: string | undefined;
    };
}

// ─── Constants ───────────────────────────────────────────────

const DEFAULT_CHUNK_SIZE = 1500;
const DEFAULT_OVERLAP = 200;
const CHARS_PER_TOKEN = 4;

// ─── Public API ──────────────────────────────────────────────

/**
 * Chunk a document's text content into embedding-ready segments.
 */
export function chunkDocument(text: string, options?: ChunkOptions): DocumentChunk[] {
    const strategy = options?.strategy ?? "section_aware";

    if (strategy === "section_aware") {
        return chunkSectionAware(text, options);
    }

    return chunkFixedSize(text, options);
}

// ─── Fixed-Size Strategy ─────────────────────────────────────

function chunkFixedSize(text: string, options?: ChunkOptions): DocumentChunk[] {
    const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const overlap = options?.overlap ?? DEFAULT_OVERLAP;
    const chunks: DocumentChunk[] = [];

    let start = 0;
    let index = 0;

    while (start < text.length) {
        let end = Math.min(start + chunkSize, text.length);

        // Try to break at a sentence or paragraph boundary
        if (end < text.length) {
            const breakPoint = findNaturalBreak(text, end, start + chunkSize * 0.8);
            if (breakPoint > start) end = breakPoint;
        }

        const content = text.slice(start, end).trim();
        if (content.length > 0) {
            chunks.push({
                content,
                index,
                tokenEstimate: Math.ceil(content.length / CHARS_PER_TOKEN),
                metadata: {},
            });
            index++;
        }

        start = end - overlap;
        if (start >= text.length) break;
        // Prevent infinite loop
        if (start <= (chunks[chunks.length - 1] ? start : 0) && end >= text.length) break;
    }

    return chunks;
}

// ─── Section-Aware Strategy ──────────────────────────────────

function chunkSectionAware(text: string, options?: ChunkOptions): DocumentChunk[] {
    const maxChunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const overlap = options?.overlap ?? DEFAULT_OVERLAP;

    // Split into sections by markdown headings or double newlines
    const sectionRegex = /(?=^#{1,4}\s)/m;
    const rawSections = text.split(sectionRegex).filter((s) => s.trim().length > 0);

    const chunks: DocumentChunk[] = [];
    let index = 0;

    for (const section of rawSections) {
        // Extract section header if present
        const headerMatch = section.match(/^(#{1,4})\s+(.+)/);
        const sectionHeader = headerMatch ? headerMatch[2]?.trim() : undefined;

        if (section.length <= maxChunkSize) {
            // Section fits in one chunk
            const content = section.trim();
            chunks.push({
                content,
                index,
                tokenEstimate: Math.ceil(content.length / CHARS_PER_TOKEN),
                metadata: { section_header: sectionHeader },
            });
            index++;
        } else {
            // Section too large — sub-chunk with fixed-size + overlap
            const subChunks = chunkFixedSize(section, {
                chunkSize: maxChunkSize,
                overlap,
                strategy: "fixed_size",
            });

            for (const sub of subChunks) {
                chunks.push({
                    ...sub,
                    index,
                    metadata: {
                        ...sub.metadata,
                        section_header: sectionHeader,
                    },
                });
                index++;
            }
        }
    }

    // Fallback: if no sections were found (plain text), use fixed-size
    if (chunks.length === 0 && text.trim().length > 0) {
        return chunkFixedSize(text, options);
    }

    return chunks;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Find a natural break point (sentence end, paragraph) near the target position.
 */
function findNaturalBreak(text: string, target: number, minPosition: number): number {
    // Prefer paragraph break
    const paragraphBreak = text.lastIndexOf("\n\n", target);
    if (paragraphBreak > minPosition) return paragraphBreak + 2;

    // Then sentence end
    const sentenceBreakers = [". ", "! ", "? ", ".\n", "!\n", "?\n"];
    let bestBreak = -1;

    for (const breaker of sentenceBreakers) {
        const pos = text.lastIndexOf(breaker, target);
        if (pos > minPosition && pos > bestBreak) {
            bestBreak = pos + breaker.length;
        }
    }

    if (bestBreak > minPosition) return bestBreak;

    // Then line break
    const lineBreak = text.lastIndexOf("\n", target);
    if (lineBreak > minPosition) return lineBreak + 1;

    // Then word boundary
    const spaceBreak = text.lastIndexOf(" ", target);
    if (spaceBreak > minPosition) return spaceBreak + 1;

    return target;
}

/**
 * Estimate total token count for a document.
 */
export function estimateDocumentTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}
