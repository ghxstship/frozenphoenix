/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Groq Adapter
   STATUS: NOT IMPLEMENTED
   
   Implements IModelProvider interface with model metadata.
   Core methods (chat, complete) throw NotImplementedError.
   Activate by wiring groq-sdk and implementing the methods below.
   ═══════════════════════════════════════════════════════════════ */

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

const GROQ_MODELS: ModelDefinition[] = [
    {
        model_key: "llama-3.3-70b-versatile",
        display_name: "Llama 3.3 70B (Groq)",
        provider: "groq",
        context_window: 128_000,
        max_output_tokens: 32_768,
        supports_vision: false,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00059,
        cost_per_1k_output: 0.00079,
    },
    {
        model_key: "llama-3.1-8b-instant",
        display_name: "Llama 3.1 8B Instant (Groq)",
        provider: "groq",
        context_window: 128_000,
        max_output_tokens: 8_192,
        supports_vision: false,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00005,
        cost_per_1k_output: 0.00008,
    },
    {
        model_key: "mixtral-8x7b-32768",
        display_name: "Mixtral 8x7B (Groq)",
        provider: "groq",
        context_window: 32_768,
        max_output_tokens: 4_096,
        supports_vision: false,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00024,
        cost_per_1k_output: 0.00024,
    },
];

class NotImplementedError extends Error {
    constructor(method: string) {
        super(
            `GroqAdapter.${method}() is not implemented. ` +
                `Wire groq-sdk and implement this method to activate.`
        );
        this.name = "NotImplementedError";
    }
}

/** @experimental — Model metadata is complete; core methods are not yet wired. */
export class GroqAdapter implements IModelProvider {
    readonly providerKey = "groq" as const;
    readonly displayName = "Groq";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: false,
        tool_use: true,
        embeddings: false,
        json_mode: true,
        extended_thinking: false,
        moderation: false,
        batch_embeddings: false,
    };

    private _apiKey: string;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    async *chat(
        _messages: ChatMessage[],
        _options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined> {
        throw new NotImplementedError("chat");
    }

    async complete(_prompt: string, _options?: CompletionOptions): Promise<string> {
        throw new NotImplementedError("complete");
    }

    async embed(_input: string | string[]): Promise<EmbeddingResult[]> {
        throw new Error("Groq does not support embeddings. Use a different provider.");
    }

    async moderate(_content: string): Promise<ModerationResult> {
        return { flagged: false, categories: {}, scores: {} };
    }

    getModels(): ModelDefinition[] {
        return GROQ_MODELS;
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    getContextWindow(model: string): number {
        const found = GROQ_MODELS.find((m) => m.model_key === model);
        return found?.context_window ?? 128_000;
    }

    async validateApiKey(_apiKey: string): Promise<boolean> {
        return !!this._apiKey;
    }
}
