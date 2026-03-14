/* ═══════════════════════════════════════════════════════════════
   AI Copilot — RAG Embedding Generator
   
   Generates vector embeddings for document chunks via the
   IModelProvider abstraction. Defaults to OpenAI text-embedding-3-small
   but falls back to any provider with embedding capability.
   ═══════════════════════════════════════════════════════════════ */

import { logger } from "@/lib/logger";
import type { EmbeddingResult, IModelProvider } from "../types";
import { ModelRegistry } from "../model-registry";

// ─── Types ───────────────────────────────────────────────────

export interface EmbedOptions {
    /** Override provider key (default: first provider with embedding support). */
    providerKey?: string;
    /** Batch size for parallel embedding calls. Default: 20. */
    batchSize?: number;
}

export interface EmbedResult {
    embeddings: number[][];
    totalTokens: number;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Embed a single text string. Returns the embedding vector.
 */
export async function embedText(text: string, options?: EmbedOptions): Promise<EmbeddingResult> {
    const provider = resolveEmbeddingProvider(options?.providerKey);
    const results = await provider.embed(text);
    const first = results[0];

    if (!first) {
        throw new Error("Embedding provider returned no results");
    }

    return first;
}

/**
 * Embed multiple text chunks in batches. Returns embeddings in order.
 */
export async function embedBatch(texts: string[], options?: EmbedOptions): Promise<EmbedResult> {
    const provider = resolveEmbeddingProvider(options?.providerKey);
    const batchSize = options?.batchSize ?? 20;

    const allEmbeddings: number[][] = [];
    let totalTokens = 0;

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        try {
            // Try batch embedding first
            const results = await provider.embed(batch);
            for (const result of results) {
                allEmbeddings.push(result.embedding);
                totalTokens += result.token_count;
            }
        } catch {
            // Fallback: embed one at a time
            logger.warn("Batch embedding failed, falling back to sequential", {
                batchIndex: i,
                batchSize: batch.length,
            });

            for (const text of batch) {
                const results = await provider.embed(text);
                const result = results[0];
                if (result) {
                    allEmbeddings.push(result.embedding);
                    totalTokens += result.token_count;
                }
            }
        }
    }

    return { embeddings: allEmbeddings, totalTokens };
}

// ─── Provider Resolution ─────────────────────────────────────

function resolveEmbeddingProvider(providerKey?: string): IModelProvider {
    const registry = ModelRegistry.getInstance();

    if (providerKey) {
        const provider = registry.getProvider(
            providerKey as Parameters<typeof registry.getProvider>[0]
        );
        if (!provider.capabilities.embeddings) {
            throw new Error(`Provider "${providerKey}" does not support embeddings`);
        }
        return provider;
    }

    // Find the first active provider with embedding support
    const providers = registry.listActiveProviders();
    const embeddingProvider = providers.find((p) => p.capabilities.embeddings);

    if (!embeddingProvider) {
        throw new Error(
            "No active provider with embedding support. " +
                "Enable OpenAI or Google AI for embeddings."
        );
    }

    return embeddingProvider;
}
