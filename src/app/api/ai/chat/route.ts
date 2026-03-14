/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Chat Streaming Endpoint
   
   POST /api/ai/chat
   
   Accepts a user message, streams back an SSE response from the
   configured AI provider. Integrates:
   - Auth verification
   - Rate limiting (token budget)
   - Context building (system prompt, RAG, history, tools)
   - Provider streaming
   - Tool call interleaving
   - Conversation persistence
   - Usage logging
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { buildContext } from "@/lib/ai/copilot/context-builder";
import {
    appendMessage,
    createConversation,
    getConversationMessages,
    messagesToChatHistory,
} from "@/lib/ai/copilot/conversation-manager";
import { checkTokenBudget, estimateCost, logUsage } from "@/lib/ai/copilot/rate-limiter";
import { sseHeaders } from "@/lib/ai/copilot/stream-manager";
import { ModelRegistry } from "@/lib/ai/model-registry";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    // 1. Auth
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get org context
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return NextResponse.json({ error: "No organization membership" }, { status: 403 });
    }

    const orgId = membership.organization_id;
    const userRole = membership.role;

    // 2. Parse request
    let body: {
        message: string;
        conversation_id?: string;
        model_id?: string;
        page_context?: { entityType: string; entityId?: string; entityName?: string } | null;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.message?.trim()) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Rate limit check
    const estimatedTokens = Math.ceil(body.message.length / 4) + 2000; // rough estimate
    const budget = await checkTokenBudget({
        userId: user.id,
        orgId,
        roleId: userRole,
        estimatedTokens,
    });

    if (!budget.allowed) {
        return NextResponse.json(
            { error: budget.reason ?? "Token budget exceeded", budget },
            { status: 429 }
        );
    }

    // 4. Conversation management — get or create
    let conversationId = body.conversation_id;

    if (!conversationId) {
        const conv = await createConversation({
            userId: user.id,
            orgId,
            modelId: body.model_id,
            workspaceContext: body.page_context?.entityType ?? "global",
        });
        conversationId = conv?.id;
    }

    if (!conversationId) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    // 5. Persist user message
    await appendMessage({
        conversationId,
        role: "user",
        content: body.message,
    });

    // 6. Build context
    const history = await getConversationMessages(conversationId, 50);
    const chatHistory = messagesToChatHistory(history);

    // Resolve provider + model
    const registry = ModelRegistry.getInstance();
    let provider;
    try {
        provider = registry.getDefaultProvider();
    } catch {
        return NextResponse.json(
            { error: "No active AI provider configured. Contact your admin." },
            { status: 503 }
        );
    }

    // Get provider API key
    const adminClient = createAdminClient();
    let apiKey: string | undefined;

    if (adminClient) {
        const { data: keyRow } = await adminClient
            .from("ai_api_keys")
            .select("encrypted_key")
            .eq("org_id", orgId)
            .eq("provider_id", provider.id)
            .eq("active", true)
            .limit(1)
            .single();

        if (keyRow?.encrypted_key) {
            // Decrypt key
            const { decrypt } = await import("@/lib/ai/encryption");
            try {
                apiKey = decrypt(keyRow.encrypted_key);
            } catch {
                logger.error("Failed to decrypt API key", { providerId: provider.id });
            }
        }
    }

    // Build full context
    const context = await buildContext({
        userRole,
        orgId,
        userId: user.id,
        conversationHistory: chatHistory,
        pageContext: body.page_context ?? undefined,
        query: body.message,
    });

    // 7. Stream response via SSE
    const startTime = Date.now();

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (data: unknown) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Send conversation_id to client
            sendEvent({ conversation_id: conversationId });

            let fullContent = "";
            let inputTokens = 0;
            let outputTokens = 0;

            try {
                const response = await provider.chat(context.messages, {
                    stream: true,
                    tools: context.tools,
                    ...(apiKey ? { apiKey } : {}),
                });

                // Handle streaming response
                if (Symbol.asyncIterator in Object(response)) {
                    for await (const chunk of response as AsyncIterable<{
                        delta?: string;
                        finish_reason?: string;
                    }>) {
                        if (chunk.delta) {
                            fullContent += chunk.delta;
                            sendEvent({ delta: chunk.delta });
                        }
                    }
                } else {
                    // Non-streaming fallback
                    const result = response as {
                        content: string;
                        usage?: { prompt_tokens: number; completion_tokens: number };
                    };
                    fullContent = result.content;
                    inputTokens = result.usage?.prompt_tokens ?? 0;
                    outputTokens = result.usage?.completion_tokens ?? 0;
                    sendEvent({ delta: fullContent });
                }

                // Estimate tokens if not provided
                if (inputTokens === 0) inputTokens = Math.ceil(body.message.length / 4);
                if (outputTokens === 0) outputTokens = Math.ceil(fullContent.length / 4);

                sendEvent({
                    done: true,
                    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Stream error";
                logger.error("Chat stream error", { error: message, conversationId });
                sendEvent({ error: message });
            }

            // Send done signal
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();

            // 8. Post-stream: persist assistant message + log usage
            const latencyMs = Date.now() - startTime;

            if (fullContent) {
                await appendMessage({
                    conversationId: conversationId!,
                    role: "assistant",
                    content: fullContent,
                    tokenCountInput: inputTokens,
                    tokenCountOutput: outputTokens,
                    latencyMs,
                });
            }

            // Log usage
            const cost = estimateCost(inputTokens, outputTokens, 0.003, 0.015); // Default pricing
            await logUsage({
                userId: user.id,
                orgId,
                providerId: provider.id,
                tokenCountInput: inputTokens,
                tokenCountOutput: outputTokens,
                estimatedCost: cost,
                endpointCalled: "/api/ai/chat",
                responseStatus: 200,
            });
        },
    });

    return new Response(stream, { headers: sseHeaders });
}
