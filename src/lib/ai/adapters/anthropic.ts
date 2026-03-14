/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Anthropic (Claude) Adapter
   
   Default, first-class provider. Fully implements IModelProvider
   using the @anthropic-ai/sdk package.
   ═══════════════════════════════════════════════════════════════ */

import Anthropic from "@anthropic-ai/sdk";
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

const CLAUDE_MODELS: ModelDefinition[] = [
    {
        model_key: "claude-sonnet-4-20250514",
        display_name: "Claude Sonnet 4",
        provider: "anthropic",
        context_window: 200_000,
        max_output_tokens: 64_000,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.003,
        cost_per_1k_output: 0.015,
    },
    {
        model_key: "claude-opus-4-20250514",
        display_name: "Claude Opus 4",
        provider: "anthropic",
        context_window: 200_000,
        max_output_tokens: 32_000,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.015,
        cost_per_1k_output: 0.075,
    },
    {
        model_key: "claude-3-5-haiku-20241022",
        display_name: "Claude 3.5 Haiku",
        provider: "anthropic",
        context_window: 200_000,
        max_output_tokens: 8_192,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.0008,
        cost_per_1k_output: 0.004,
    },
];

export class AnthropicAdapter implements IModelProvider {
    readonly providerKey = "anthropic" as const;
    readonly displayName = "Anthropic";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: true,
        tool_use: true,
        embeddings: false,
        json_mode: true,
        extended_thinking: true,
        moderation: false,
        batch_embeddings: false,
    };

    private client: Anthropic;

    constructor(apiKey: string, baseUrl?: string) {
        this.client = new Anthropic({
            apiKey,
            ...(baseUrl ? { baseURL: baseUrl } : {}),
        });
    }

    async *chat(
        messages: ChatMessage[],
        options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined> {
        const model = options?.model ?? "claude-sonnet-4-20250514";
        const systemMessage = messages.find((m) => m.role === "system");
        const nonSystemMessages = messages.filter((m) => m.role !== "system");

        const anthropicMessages = nonSystemMessages.map((m) => this.toAnthropicMessage(m));

        const tools = options?.tools?.map((t) => ({
            name: t.name,
            description: t.description,
            input_schema: t.parameters as Anthropic.Tool.InputSchema,
        }));

        const stream = this.client.messages.stream({
            model,
            max_tokens: options?.max_tokens ?? 4096,
            temperature: options?.temperature,
            top_p: options?.top_p,
            stop_sequences: options?.stop_sequences,
            system: systemMessage?.content ?? options?.system_prompt,
            messages: anthropicMessages,
            ...(tools && tools.length > 0 ? { tools } : {}),
        });

        let currentToolCallId: string | undefined;
        let currentToolName: string | undefined;
        let toolInputJson = "";

        for await (const event of stream) {
            if (event.type === "content_block_start") {
                if (event.content_block.type === "tool_use") {
                    currentToolCallId = event.content_block.id;
                    currentToolName = event.content_block.name;
                    toolInputJson = "";
                }
            } else if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                    yield { delta: event.delta.text };
                } else if (event.delta.type === "input_json_delta") {
                    toolInputJson += event.delta.partial_json;
                }
            } else if (event.type === "content_block_stop") {
                if (currentToolCallId && currentToolName) {
                    let parsedArgs: Record<string, unknown> = {};
                    try {
                        parsedArgs = JSON.parse(toolInputJson || "{}") as Record<string, unknown>;
                    } catch {
                        parsedArgs = {};
                    }
                    yield {
                        delta: "",
                        tool_call: {
                            id: currentToolCallId,
                            name: currentToolName,
                            arguments: parsedArgs,
                        },
                    };
                    currentToolCallId = undefined;
                    currentToolName = undefined;
                    toolInputJson = "";
                }
            } else if (event.type === "message_delta") {
                const stopReason = event.delta.stop_reason;
                let finishReason: CopilotChunk["finish_reason"];
                if (stopReason === "end_turn") finishReason = "stop";
                else if (stopReason === "tool_use") finishReason = "tool_use";
                else if (stopReason === "max_tokens") finishReason = "max_tokens";

                yield {
                    delta: "",
                    finish_reason: finishReason,
                    usage: event.usage
                        ? {
                              input_tokens: 0,
                              output_tokens: event.usage.output_tokens,
                          }
                        : undefined,
                };
            } else if (event.type === "message_start" && event.message.usage) {
                yield {
                    delta: "",
                    usage: {
                        input_tokens: event.message.usage.input_tokens,
                        output_tokens: 0,
                    },
                };
            }
        }
    }

    async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const model = options?.model ?? "claude-sonnet-4-20250514";

        const response = await this.client.messages.create({
            model,
            max_tokens: options?.max_tokens ?? 4096,
            temperature: options?.temperature,
            top_p: options?.top_p,
            system: options?.system_prompt,
            messages: [{ role: "user", content: prompt }],
        });

        const textBlock = response.content.find((c) => c.type === "text");
        return textBlock?.type === "text" ? textBlock.text : "";
    }

    async embed(_input: string | string[]): Promise<EmbeddingResult[]> {
        throw new Error(
            "Anthropic does not natively support embeddings. " +
                "Use Voyage AI or OpenAI text-embedding-3-small via the respective adapter."
        );
    }

    async moderate(_content: string): Promise<ModerationResult> {
        return {
            flagged: false,
            categories: {},
            scores: {},
        };
    }

    getModels(): ModelDefinition[] {
        return CLAUDE_MODELS;
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 3.5);
    }

    getContextWindow(model: string): number {
        const found = CLAUDE_MODELS.find((m) => m.model_key === model);
        return found?.context_window ?? 200_000;
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            const testClient = new Anthropic({ apiKey });
            await testClient.messages.create({
                model: "claude-3-5-haiku-20241022",
                max_tokens: 1,
                messages: [{ role: "user", content: "hi" }],
            });
            return true;
        } catch {
            return false;
        }
    }

    private toAnthropicMessage(msg: ChatMessage): Anthropic.MessageParam {
        if (msg.role === "tool_result") {
            return {
                role: "user",
                content: [
                    {
                        type: "tool_result",
                        tool_use_id: msg.tool_call_id ?? "",
                        content: msg.content,
                    },
                ],
            };
        }

        const content: Anthropic.ContentBlockParam[] = [];

        if (msg.attachments?.length) {
            for (const attachment of msg.attachments) {
                if (attachment.type === "image" && attachment.base64) {
                    content.push({
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: attachment.mime_type as
                                | "image/jpeg"
                                | "image/png"
                                | "image/gif"
                                | "image/webp",
                            data: attachment.base64,
                        },
                    });
                }
            }
        }

        content.push({ type: "text", text: msg.content });

        return {
            role: msg.role === "user" || msg.role === "tool_call" ? "user" : "assistant",
            content,
        };
    }
}
