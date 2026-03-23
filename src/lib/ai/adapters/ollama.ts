/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Ollama Adapter (Local/Self-Hosted Models)
   
   Full IModelProvider implementation for on-prem/privacy use cases
   using the ollama SDK.
   ═══════════════════════════════════════════════════════════════ */

import { Ollama } from "ollama";
import type {
    ChatMessage,
    CompletionOptions,
    CopilotChunk,
    EmbeddingResult,
    IModelProvider,
    ModelDefinition,
    ModerationResult,
    ProviderCapabilities,
} from "../types";

export class OllamaAdapter implements IModelProvider {
    readonly providerKey = "ollama" as const;
    readonly displayName = "Ollama (Local)";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: true,
        tool_use: true,
        embeddings: true,
        json_mode: true,
        extended_thinking: false,
        moderation: false,
        batch_embeddings: false,
    };

    private client: Ollama;
    private baseUrl: string;
    private cachedModels: ModelDefinition[] | null = null;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
        this.client = new Ollama({ host: this.baseUrl });
    }

    async *chat(
        messages: ChatMessage[],
        options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined> {
        const model = options?.model ?? "llama3.1";

        const ollamaMessages = messages.map((m) => ({
            role: m.role === "tool_call" ? "assistant" : m.role === "tool_result" ? "tool" : m.role,
            content: m.content,
            ...(m.attachments?.some((a) => a.type === "image" && a.base64)
                ? {
                      images: m.attachments
                          .filter((a) => a.type === "image" && a.base64)
                          .map((a) => a.base64!),
                  }
                : {}),
        }));

        const tools = options?.tools?.map((t) => ({
            type: "function" as const,
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }));

        const response = await this.client.chat({
            model,
            messages: ollamaMessages,
            stream: true,
            options: {
                ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
                ...(options?.top_p !== undefined ? { top_p: options.top_p } : {}),
                ...(options?.max_tokens !== undefined ? { num_predict: options.max_tokens } : {}),
                ...(options?.stop_sequences ? { stop: options.stop_sequences } : {}),
            },
            ...(options?.json_mode ? { format: "json" } : {}),
            ...(tools && tools.length > 0 ? { tools } : {}),
        });

        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        for await (const chunk of response) {
            if (chunk.message?.content) {
                yield { delta: chunk.message.content };
            }

            if (chunk.message?.tool_calls) {
                for (const tc of chunk.message.tool_calls) {
                    yield {
                        delta: "",
                        tool_call: {
                            id: `ollama_${Date.now()}_${tc.function?.name ?? "tool"}`,
                            name: tc.function?.name ?? "",
                            arguments: (tc.function?.arguments ?? {}) as Record<string, unknown>,
                        },
                    };
                }
            }

            if (chunk.done) {
                totalInputTokens = chunk.prompt_eval_count ?? 0;
                totalOutputTokens = chunk.eval_count ?? 0;

                yield {
                    delta: "",
                    finish_reason: "stop",
                    usage: {
                        input_tokens: totalInputTokens,
                        output_tokens: totalOutputTokens,
                    },
                };
            }
        }
    }

    async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const model = options?.model ?? "llama3.1";

        const response = await this.client.generate({
            model,
            prompt,
            ...(options?.system_prompt ? { system: options.system_prompt } : {}),
            options: {
                ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
                ...(options?.top_p !== undefined ? { top_p: options.top_p } : {}),
                ...(options?.max_tokens !== undefined ? { num_predict: options.max_tokens } : {}),
            },
        });

        return response.response;
    }

    async embed(input: string | string[]): Promise<EmbeddingResult[]> {
        const inputs = Array.isArray(input) ? input : [input];
        const results: EmbeddingResult[] = [];

        for (const text of inputs) {
            const response = await this.client.embed({
                model: "nomic-embed-text",
                input: text,
            });
            const firstEmbedding = response.embeddings[0];
            results.push({
                embedding: firstEmbedding ?? [],
                token_count: this.estimateTokens(text),
            });
        }

        return results;
    }

    async moderate(_content: string): Promise<ModerationResult> {
        return { flagged: false, categories: {}, scores: {} };
    }

    getModels(): ModelDefinition[] {
        if (this.cachedModels) return this.cachedModels;

        return [
            {
                model_key: "llama3.1",
                display_name: "Llama 3.1 (8B)",
                provider: "ollama",
                context_window: 128_000,
                max_output_tokens: 4096,
                supports_vision: false,
                supports_tools: true,
                supports_streaming: true,
                supports_json_mode: true,
                supports_extended_thinking: false,
                cost_per_1k_input: 0,
                cost_per_1k_output: 0,
            },
            {
                model_key: "llama3.2-vision",
                display_name: "Llama 3.2 Vision (11B)",
                provider: "ollama",
                context_window: 128_000,
                max_output_tokens: 4096,
                supports_vision: true,
                supports_tools: true,
                supports_streaming: true,
                supports_json_mode: true,
                supports_extended_thinking: false,
                cost_per_1k_input: 0,
                cost_per_1k_output: 0,
            },
            {
                model_key: "nomic-embed-text",
                display_name: "Nomic Embed Text",
                provider: "ollama",
                context_window: 8_192,
                max_output_tokens: 0,
                supports_vision: false,
                supports_tools: false,
                supports_streaming: false,
                supports_json_mode: false,
                supports_extended_thinking: false,
                cost_per_1k_input: 0,
                cost_per_1k_output: 0,
            },
        ];
    }

    /**
     * Refresh model list from running Ollama instance.
     */
    async refreshModels(): Promise<ModelDefinition[]> {
        try {
            const list = await this.client.list();
            this.cachedModels = list.models.map((m) => ({
                model_key: m.name,
                display_name: m.name,
                provider: "ollama" as const,
                context_window: 128_000,
                max_output_tokens: 4096,
                supports_vision: m.name.includes("vision") || m.name.includes("llava"),
                supports_tools: true,
                supports_streaming: true,
                supports_json_mode: true,
                supports_extended_thinking: false,
                cost_per_1k_input: 0,
                cost_per_1k_output: 0,
            }));
            return this.cachedModels;
        } catch {
            return this.getModels();
        }
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    getContextWindow(model: string): number {
        const found = this.getModels().find((m) => m.model_key === model);
        return found?.context_window ?? 128_000;
    }

    async validateApiKey(_apiKey: string): Promise<boolean> {
        try {
            await this.client.list();
            return true;
        } catch {
            return false;
        }
    }
}
