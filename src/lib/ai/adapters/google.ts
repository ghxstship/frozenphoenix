/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Google (Gemini) Adapter
   
   Full IModelProvider implementation using @google/generative-ai.
   ═══════════════════════════════════════════════════════════════ */

import { GoogleGenerativeAI, type Part, type Tool } from "@google/generative-ai";
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

const GEMINI_MODELS: ModelDefinition[] = [
    {
        model_key: "gemini-2.5-pro",
        display_name: "Gemini 2.5 Pro",
        provider: "google",
        context_window: 1_048_576,
        max_output_tokens: 65_536,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.00125,
        cost_per_1k_output: 0.01,
    },
    {
        model_key: "gemini-2.5-flash",
        display_name: "Gemini 2.5 Flash",
        provider: "google",
        context_window: 1_048_576,
        max_output_tokens: 65_536,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: true,
        cost_per_1k_input: 0.00015,
        cost_per_1k_output: 0.0006,
    },
    {
        model_key: "gemini-2.0-flash",
        display_name: "Gemini 2.0 Flash",
        provider: "google",
        context_window: 1_048_576,
        max_output_tokens: 8_192,
        supports_vision: true,
        supports_tools: true,
        supports_streaming: true,
        supports_json_mode: true,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.0001,
        cost_per_1k_output: 0.0004,
    },
    {
        model_key: "text-embedding-004",
        display_name: "Gemini Text Embedding 004",
        provider: "google",
        context_window: 2_048,
        max_output_tokens: 0,
        supports_vision: false,
        supports_tools: false,
        supports_streaming: false,
        supports_json_mode: false,
        supports_extended_thinking: false,
        cost_per_1k_input: 0.000004,
        cost_per_1k_output: 0,
    },
];

export class GoogleAdapter implements IModelProvider {
    readonly providerKey = "google" as const;
    readonly displayName = "Google AI";
    readonly capabilities: ProviderCapabilities = {
        streaming: true,
        vision: true,
        tool_use: true,
        embeddings: true,
        json_mode: true,
        extended_thinking: true,
        moderation: false,
        batch_embeddings: true,
    };

    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async *chat(
        messages: ChatMessage[],
        options?: CompletionOptions
    ): AsyncGenerator<CopilotChunk, void, undefined> {
        const modelKey = options?.model ?? "gemini-2.5-flash";
        const systemMessage = messages.find((m) => m.role === "system");
        const nonSystemMessages = messages.filter((m) => m.role !== "system");

        const systemInstruction = systemMessage?.content ?? options?.system_prompt;
        const model = this.genAI.getGenerativeModel({
            model: modelKey,
            ...(systemInstruction ? { systemInstruction } : {}),
        });

        const tools = options?.tools?.map((t) => ({
            functionDeclarations: [
                {
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters,
                },
            ],
        })) as Tool[] | undefined;

        const history = nonSystemMessages.slice(0, -1).map((m) => ({
            role: m.role === "assistant" ? ("model" as const) : ("user" as const),
            parts: this.toParts(m),
        }));

        const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];
        const lastParts = lastMessage ? this.toParts(lastMessage) : [{ text: "" }];

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: options?.max_tokens ?? 4096,
                ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
                ...(options?.top_p !== undefined ? { topP: options.top_p } : {}),
                ...(options?.stop_sequences !== undefined
                    ? { stopSequences: options.stop_sequences }
                    : {}),
                ...(options?.json_mode ? { responseMimeType: "application/json" } : {}),
            },
            ...(tools && tools.length > 0 ? { tools } : {}),
        });

        const result = await chat.sendMessageStream(lastParts);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                yield { delta: text };
            }

            const functionCalls = chunk.functionCalls();
            if (functionCalls) {
                for (const fc of functionCalls) {
                    yield {
                        delta: "",
                        tool_call: {
                            id: `gc_${Date.now()}_${fc.name}`,
                            name: fc.name,
                            arguments: (fc.args ?? {}) as Record<string, unknown>,
                        },
                    };
                }
            }
        }

        const finalResponse = await result.response;
        const usageMeta = finalResponse.usageMetadata;

        yield {
            delta: "",
            finish_reason: "stop",
            usage: usageMeta
                ? {
                      input_tokens: usageMeta.promptTokenCount ?? 0,
                      output_tokens: usageMeta.candidatesTokenCount ?? 0,
                  }
                : undefined,
        };
    }

    async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const modelKey = options?.model ?? "gemini-2.5-flash";
        const model = this.genAI.getGenerativeModel({
            model: modelKey,
            ...(options?.system_prompt ? { systemInstruction: options.system_prompt } : {}),
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: options?.max_tokens ?? 4096,
                ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
            },
        });

        return result.response.text();
    }

    async embed(input: string | string[]): Promise<EmbeddingResult[]> {
        const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        const inputs = Array.isArray(input) ? input : [input];

        const results: EmbeddingResult[] = [];
        for (const text of inputs) {
            const result = await model.embedContent(text);
            results.push({
                embedding: result.embedding.values,
                token_count: this.estimateTokens(text),
            });
        }
        return results;
    }

    async moderate(_content: string): Promise<ModerationResult> {
        return { flagged: false, categories: {}, scores: {} };
    }

    getModels(): ModelDefinition[] {
        return GEMINI_MODELS;
    }

    estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    getContextWindow(model: string): number {
        const found = GEMINI_MODELS.find((m) => m.model_key === model);
        return found?.context_window ?? 1_048_576;
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            const testGenAI = new GoogleGenerativeAI(apiKey);
            const model = testGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            await model.generateContent("hi");
            return true;
        } catch {
            return false;
        }
    }

    private toParts(msg: ChatMessage): Part[] {
        const parts: Part[] = [];

        if (msg.attachments?.length) {
            for (const attachment of msg.attachments) {
                if (attachment.type === "image" && attachment.base64) {
                    parts.push({
                        inlineData: {
                            mimeType: attachment.mime_type,
                            data: attachment.base64,
                        },
                    });
                }
            }
        }

        if (msg.role === "tool_result") {
            parts.push({
                functionResponse: {
                    name: msg.name ?? "tool",
                    response: { content: msg.content },
                },
            });
        } else {
            parts.push({ text: msg.content });
        }

        return parts;
    }
}
