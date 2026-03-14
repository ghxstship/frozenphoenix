/* ═══════════════════════════════════════════════════════════════
   AI Copilot — OpenAI (GPT, o-series) Adapter
   
   Full IModelProvider implementation using the openai SDK.
   ═══════════════════════════════════════════════════════════════ */

import OpenAI from "openai";
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

const OPENAI_MODELS: ModelDefinition[] = [
    {
        model_key: "gpt-4o",
        display_name: "GPT-4o",
        provider: "openai",
        context_window: 128_000,
        max_output_tokens: 16_384,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.0025,
        cost_per_1k_output: 0.01,
    },
    {
        model_key: "gpt-4o-mini",
        display_name: "GPT-4o Mini",
        provider: "openai",
        context_window: 128_000,
        max_output_tokens: 16_384,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00015,
        cost_per_1k_output: 0.0006,
    },
    {
        model_key: "o3",
        display_name: "o3",
        provider: "openai",
        context_window: 200_000,
        max_output_tokens: 100_000,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.01,
        cost_per_1k_output: 0.04,
    },
    {
        model_key: "o3-mini",
        display_name: "o3 Mini",
        provider: "openai",
        context_window: 200_000,
        max_output_tokens: 100_000,
        supports_vision: false,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.0011,
        cost_per_1k_output: 0.0044,
    },
    {
        model_key: "text-embedding-3-small",
        display_name: "Embedding 3 Small",
        provider: "openai",
        context_window: 8_191,
        max_output_tokens: 0,
        supports_vision: false,
        supports_tools: false,
        supports_streaming: false,
        supports_json_mode: false,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00002,
        cost_per_1k_output: 0,
    },
    {
        model_key: "text-embedding-3-large",
        display_name: "Embedding 3 Large",
        provider: "openai",
        context_window: 8_191,
        max_output_tokens: 0,
        supports_vision: false,
        supports_tools: false,
        supports_streaming: false,
        supports_json_mode: false,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.00013,
        cost_per_1k_output: 0,
    },
];

export class OpenAIAdapter implements IModelProvider {
    readonly providerKey = "openai" as const;
    readonly displayName = "OpenAI";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: true,
        tool_use: true,
        embeddings: true,
        json_mode: true,
        extended_thinking: true,
        moderation: true,
        batch_embeddings: true,
    };

    private client: OpenAI;

    constructor(apiKey: string, baseUrl?: string) {
        this.client = new OpenAI({
            apiKey,
            ...(baseUrl ? { baseURL: baseUrl } : {}),
        });
    }

    async *chat(
        messages: ChatMessage[],
        options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined> {
        const model = options?.model ?? "gpt-4o";

        const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((m) =>
            this.toOpenAIMessage(m)
        );

        const tools: OpenAI.ChatCompletionTool[] | undefined = options?.tools?.map((t) => ({
            type: "function" as const,
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }));

        const stream = await this.client.chat.completions.create({
            model,
            messages: openaiMessages,
            max_tokens: options?.max_tokens ?? 4096,
            temperature: options?.temperature,
            top_p: options?.top_p,
            stop: options?.stop_sequences,
            stream: true,
            ...(tools && tools.length > 0 ? { tools } : {}),
            ...(options?.json_mode ? { response_format: { type: "json_object" } } : {}),
        });

        const toolCallAccumulators = new Map<number, { id: string; name: string; args: string }>();

        for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            const delta = choice.delta;

            if (delta?.content) {
                yield { delta: delta.content };
            }

            if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                    const idx = tc.index;
                    if (!toolCallAccumulators.has(idx)) {
                        toolCallAccumulators.set(idx, {
                            id: tc.id ?? "",
                            name: tc.function?.name ?? "",
                            args: "",
                        });
                    }
                    const acc = toolCallAccumulators.get(idx)!;
                    if (tc.id) acc.id = tc.id;
                    if (tc.function?.name) acc.name = tc.function.name;
                    if (tc.function?.arguments) acc.args += tc.function.arguments;
                }
            }

            if (choice.finish_reason) {
                for (const [, acc] of toolCallAccumulators) {
                    let parsedArgs: Record<string, unknown> = {};
                    try {
                        parsedArgs = JSON.parse(acc.args || "{}") as Record<string, unknown>;
                    } catch {
                        parsedArgs = {};
                    }
                    yield {
                        delta: "",
                        tool_call: {
                            id: acc.id,
                            name: acc.name,
                            arguments: parsedArgs,
                        },
                    };
                }
                toolCallAccumulators.clear();

                let finishReason: CopilotChunk["finish_reason"];
                if (choice.finish_reason === "stop") finishReason = "stop";
                else if (choice.finish_reason === "tool_calls") finishReason = "tool_use";
                else if (choice.finish_reason === "length") finishReason = "max_tokens";

                yield {
                    delta: "",
                    finish_reason: finishReason,
                    usage: chunk.usage
                        ? {
                              input_tokens: chunk.usage.prompt_tokens,
                              output_tokens: chunk.usage.completion_tokens,
                          }
                        : undefined,
                };
            }
        }
    }

    async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const model = options?.model ?? "gpt-4o";

        const messages: OpenAI.ChatCompletionMessageParam[] = [];
        if (options?.system_prompt) {
            messages.push({ role: "system", content: options.system_prompt });
        }
        messages.push({ role: "user", content: prompt });

        const response = await this.client.chat.completions.create({
            model,
            messages,
            max_tokens: options?.max_tokens ?? 4096,
            temperature: options?.temperature,
        });

        return response.choices[0]?.message?.content ?? "";
    }

    async embed(input: string | string[]): Promise<EmbeddingResult[]> {
        const inputs = Array.isArray(input) ? input : [input];
        const response = await this.client.embeddings.create({
            model: "text-embedding-3-small",
            input: inputs,
        });

        return response.data.map((d, i) => ({
            embedding: d.embedding,
            token_count: response.usage?.prompt_tokens
                ? Math.ceil(response.usage.prompt_tokens / inputs.length)
                : this.estimateTokens(inputs[i] ?? ""),
        }));
    }

    async moderate(content: string): Promise<ModerationResult> {
        const response = await this.client.moderations.create({ input: content });
        const result = response.results[0];
        if (!result) {
            return { flagged: false, categories: {}, scores: {} };
        }
        const categories: Record<string, boolean> = {};
        const scores: Record<string, number> = {};
        for (const [key, value] of Object.entries(result.categories)) {
            categories[key] = value;
        }
        for (const [key, value] of Object.entries(result.category_scores)) {
            scores[key] = value;
        }
        return { flagged: result.flagged, categories, scores };
    }

    getModels(): ModelDefinition[] {
        return OPENAI_MODELS;
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    getContextWindow(model: string): number {
        const found = OPENAI_MODELS.find((m) => m.model_key === model);
        return found?.context_window ?? 128_000;
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            const testClient = new OpenAI({ apiKey });
            await testClient.models.list();
            return true;
        } catch {
            return false;
        }
    }

    private toOpenAIMessage(msg: ChatMessage): OpenAI.ChatCompletionMessageParam {
        if (msg.role === "system") {
            return { role: "system", content: msg.content };
        }
        if (msg.role === "tool_result") {
            return {
                role: "tool",
                tool_call_id: msg.tool_call_id ?? "",
                content: msg.content,
            };
        }
        if (msg.role === "assistant") {
            if (msg.tool_calls?.length) {
                return {
                    role: "assistant",
                    content: msg.content || null,
                    tool_calls: msg.tool_calls.map((tc) => ({
                        id: tc.id,
                        type: "function" as const,
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.arguments),
                        },
                    })),
                };
            }
            return { role: "assistant", content: msg.content };
        }

        // User message with potential vision content
        if (msg.attachments?.some((a) => a.type === "image")) {
            const content: OpenAI.ChatCompletionContentPart[] = [];
            for (const attachment of msg.attachments ?? []) {
                if (attachment.type === "image") {
                    const imageUrl = attachment.base64
                        ? `data:${attachment.mime_type};base64,${attachment.base64}`
                        : (attachment.url ?? "");
                    content.push({
                        type: "image_url",
                        image_url: { url: imageUrl },
                    });
                }
            }
            content.push({ type: "text", text: msg.content });
            return { role: "user", content };
        }

        return { role: "user", content: msg.content };
    }
}
