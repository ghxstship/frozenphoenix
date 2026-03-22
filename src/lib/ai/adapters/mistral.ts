/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Mistral Adapter
   STATUS: NOT IMPLEMENTED
   
   Implements IModelProvider interface with model metadata.
   Core methods (chat, complete, embed) throw NotImplementedError.
   Activate by wiring @mistralai/mistralai and implementing below.
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

const MISTRAL_MODELS: ModelDefinition[] = [
    {
        model_key: "mistral-large-latest",
        display_name: "Mistral Large",
        provider: "mistral",
        context_window: 128_000,
        max_output_tokens: 8_192,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.002,
        cost_per_1k_output: 0.006,
    },
    {
        model_key: "mistral-small-latest",
        display_name: "Mistral Small",
        provider: "mistral",
        context_window: 128_000,
        max_output_tokens: 8_192,
        supports_vision: false,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.0002,
        cost_per_1k_output: 0.0006,
    },
    {
        model_key: "mistral-embed",
        display_name: "Mistral Embed",
        provider: "mistral",
        context_window: 8_192,
        max_output_tokens: 0,
        supports_vision: false,
        supports_tools: false,
        supports_streaming: false,
        supports_json_mode: false,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.0001,
        cost_per_1k_output: 0,
    },
];

class NotImplementedError extends Error {
    constructor(method: string) {
        super(
            `MistralAdapter.${method}() is not implemented. ` +
                `Wire @mistralai/mistralai and implement this method to activate.`
        );
        this.name = "NotImplementedError";
    }
}

/** @experimental — Model metadata is complete; core methods are not yet wired. */
export class MistralAdapter implements IModelProvider {
    readonly providerKey = "mistral" as const;
    readonly displayName = "Mistral AI";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: true,
        tool_use: true,
        embeddings: true,
        json_mode: true,
        extended_thinking: false,
        moderation: false,
        batch_embeddings: true,
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
        throw new NotImplementedError("embed");
    }

    async moderate(_content: string): Promise<ModerationResult> {
        return { flagged: false, categories: {}, scores: {} };
    }

    getModels(): ModelDefinition[] {
        return MISTRAL_MODELS;
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    getContextWindow(model: string): number {
        const found = MISTRAL_MODELS.find((m) => m.model_key === model);
        return found?.context_window ?? 128_000;
    }

    async validateApiKey(_apiKey: string): Promise<boolean> {
        return !!this._apiKey;
    }
}
