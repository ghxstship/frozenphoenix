/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Stream Manager
   
   Unified SSE streaming handler that:
   1. Normalizes all provider chunks → CopilotChunk format
   2. Encodes chunks as SSE events for API route responses
   3. Handles tool-call interleaving (pause stream → execute → resume)
   4. Tracks token usage across the full stream lifecycle
   ═══════════════════════════════════════════════════════════════ */

import type {
    ChatMessage,
    CompletionOptions,
    CopilotChunk,
    IModelProvider,
    TokenUsage,
} from "../types";
import type { PlatformTool } from "./tool-definitions";
import type { ToolOrchestrator } from "./tool-orchestrator";

// ─── Types ───────────────────────────────────────────────────

export interface StreamResult {
    fullText: string;
    usage: TokenUsage;
    toolCallsMade: number;
    finishReason: CopilotChunk["finish_reason"];
}

export interface StreamCallbacks {
    onChunk?: ((chunk: CopilotChunk) => void) | undefined;
    onToolCallStart?: ((toolName: string) => void) | undefined;
    onToolCallEnd?: ((toolName: string, result: string) => void) | undefined;
    onError?: ((error: Error) => void) | undefined;
    onDone?: ((result: StreamResult) => void) | undefined;
}

// ─── SSE Encoding ────────────────────────────────────────────

/**
 * Encode a CopilotChunk as an SSE event string.
 */
export function encodeSSEChunk(chunk: CopilotChunk): string {
    return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Encode the SSE stream terminator.
 */
export function encodeSSEDone(): string {
    return "data: [DONE]\n\n";
}

/**
 * Create a ReadableStream that produces SSE-encoded chunks from a provider.
 * Handles tool-call loops internally when a ToolOrchestrator is provided.
 */
export function createSSEStream(
    provider: IModelProvider,
    messages: ChatMessage[],
    options: CompletionOptions,
    orchestrator?: ToolOrchestrator,
    availableTools?: PlatformTool[],
    callbacks?: StreamCallbacks,
    maxToolRounds = 5
): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                const result = await runStreamWithToolLoop(
                    provider,
                    messages,
                    options,
                    orchestrator,
                    availableTools,
                    maxToolRounds,
                    (chunk) => {
                        controller.enqueue(encoder.encode(encodeSSEChunk(chunk)));
                        callbacks?.onChunk?.(chunk);
                    },
                    callbacks
                );

                controller.enqueue(encoder.encode(encodeSSEDone()));
                callbacks?.onDone?.(result);
                controller.close();
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                callbacks?.onError?.(err);

                const errorChunk: CopilotChunk = {
                    delta: "",
                    finish_reason: "error",
                    usage: { input_tokens: 0, output_tokens: 0 },
                };
                controller.enqueue(encoder.encode(encodeSSEChunk(errorChunk)));
                controller.enqueue(encoder.encode(encodeSSEDone()));
                controller.close();
            }
        },
    });
}

// ─── Stream + Tool Loop ──────────────────────────────────────

async function runStreamWithToolLoop(
    provider: IModelProvider,
    messages: ChatMessage[],
    options: CompletionOptions,
    orchestrator: ToolOrchestrator | undefined,
    availableTools: PlatformTool[] | undefined,
    maxRounds: number,
    emitChunk: (chunk: CopilotChunk) => void,
    callbacks?: StreamCallbacks
): Promise<StreamResult> {
    const currentMessages = [...messages];
    let fullText = "";
    const totalUsage: TokenUsage = { input_tokens: 0, output_tokens: 0 };
    let toolCallsMade = 0;
    let finishReason: CopilotChunk["finish_reason"];

    for (let round = 0; round < maxRounds; round++) {
        let roundText = "";
        const pendingToolCalls: Array<{
            id: string;
            name: string;
            arguments: Record<string, unknown>;
        }> = [];
        let roundFinish: CopilotChunk["finish_reason"];

        const stream = provider.chat(currentMessages, options);

        for await (const chunk of stream) {
            if (chunk.delta) {
                roundText += chunk.delta;
                emitChunk(chunk);
            }

            if (chunk.tool_call) {
                pendingToolCalls.push(chunk.tool_call);
                emitChunk(chunk);
            }

            if (chunk.usage) {
                totalUsage.input_tokens += chunk.usage.input_tokens;
                totalUsage.output_tokens += chunk.usage.output_tokens;
            }

            if (chunk.finish_reason) {
                roundFinish = chunk.finish_reason;
            }
        }

        fullText += roundText;

        // If tool calls were made, execute them and continue the loop
        if (
            roundFinish === "tool_use" &&
            pendingToolCalls.length > 0 &&
            orchestrator &&
            availableTools
        ) {
            // Add assistant message with tool calls
            currentMessages.push({
                role: "assistant",
                content: roundText,
                tool_calls: pendingToolCalls,
            });

            // Execute each tool call
            for (const tc of pendingToolCalls) {
                callbacks?.onToolCallStart?.(tc.name);

                const toolDef = availableTools.find((t) => t.name === tc.name);
                const result = toolDef
                    ? await orchestrator.executeTool(toolDef, tc.arguments)
                    : `Error: Tool "${tc.name}" not found or not available`;

                callbacks?.onToolCallEnd?.(tc.name, result);
                toolCallsMade++;

                // Emit a tool activity chunk so the UI can show what happened
                emitChunk({
                    delta: "",
                    tool_call: {
                        id: tc.id,
                        name: tc.name,
                        arguments: { _result: result },
                    },
                });

                // Add tool result to conversation
                currentMessages.push({
                    role: "tool_result",
                    content: result,
                    tool_call_id: tc.id,
                    name: tc.name,
                });
            }

            // Continue the loop — model will process tool results
            continue;
        }

        // No tool calls or not tool_use finish — we're done
        finishReason = roundFinish;
        break;
    }

    return {
        fullText,
        usage: totalUsage,
        toolCallsMade,
        finishReason,
    };
}

/**
 * Create SSE response headers for Next.js API routes.
 */
export function sseHeaders(): HeadersInit {
    return {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
    };
}
