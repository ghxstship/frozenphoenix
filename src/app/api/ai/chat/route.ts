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

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { buildCopilotContext } from "@/lib/ai/copilot/context-builder";
import type { PermissionLevel } from "@/types";
import {
    appendMessage,
    createConversation,
    getConversationMessages,
    messagesToChatHistory,
} from "@/lib/ai/copilot/conversation-manager";
import { checkTokenBudget, estimateCost, logUsage } from "@/lib/ai/copilot/rate-limiter";
import { sseHeaders } from "@/lib/ai/copilot/stream-manager";
import { ModelRegistry } from "@/lib/ai/model-registry";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/ai/chat",
        mutation: true,
        rbac: { resource: "ai", action: "write" },
    },
    async (req, { supabase, user, log }) => {
        // Get org context
        const { data: membership } = await supabase
            .from("org_memberships")
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

        // Resolve provider DB ID for API key lookup
        const adminClient = createAdminClient();
        let apiKey: string | undefined;
        let providerDbId: string | undefined;

        if (adminClient) {
            const { data: provRow } = await adminClient
                .from("ai_providers")
                .select("id")
                .eq("provider_key", provider.providerKey)
                .limit(1)
                .single();
            providerDbId = provRow?.id;

            // Get provider API key
            if (providerDbId) {
                const { data: keyRow } = await adminClient
                    .from("ai_api_keys")
                    .select("encrypted_key")
                    .eq("org_id", orgId)
                    .eq("provider_id", providerDbId)
                    .eq("is_valid", true)
                    .limit(1)
                    .single();

                if (keyRow?.encrypted_key) {
                    const { decryptApiKey } = await import("@/lib/ai/encryption");
                    try {
                        apiKey = decryptApiKey(keyRow.encrypted_key);
                    } catch {
                        log.error("Failed to decrypt API key", {
                            providerKey: provider.providerKey,
                        });
                    }
                }
            }
        }

        // Build full context
        const defaultModel = provider.getModels()[0];
        if (!defaultModel) {
            return NextResponse.json(
                { error: "No models available for provider" },
                { status: 503 }
            );
        }
        const context = buildCopilotContext(
            {
                role: userRole as PermissionLevel,
                orgId,
                userId: user.id,
                workspaceContext: body.page_context?.entityType ?? "global",
                pageContext: body.page_context ?? undefined,
                permissions: [],
            },
            chatHistory.map((m) => ({ role: m.role, content: m.content })),
            defaultModel
        );

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
                    const stream = provider.chat(context.messages, {
                        ...context.options,
                        ...(apiKey ? { apiKey } : {}),
                    });

                    for await (const chunk of stream) {
                        if (chunk.delta) {
                            fullContent += chunk.delta;
                            sendEvent({ delta: chunk.delta });
                        }
                        if (chunk.tool_call) {
                            sendEvent({ tool_call: chunk.tool_call });
                        }
                        if (chunk.usage) {
                            inputTokens = chunk.usage.input_tokens;
                            outputTokens = chunk.usage.output_tokens;
                        }
                    }

                    // Estimate tokens if not provided
                    if (inputTokens === 0) inputTokens = Math.ceil(body.message.length / 4);
                    if (outputTokens === 0) outputTokens = Math.ceil(fullContent.length / 4);

                    sendEvent({
                        done: true,
                        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
                    });
                } catch (error) {
                    const detail = error instanceof Error ? error.message : "Stream error";
                    log.error("Chat stream error", { error: detail, conversationId });
                    sendEvent({ error: "An error occurred during streaming" });
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
                    providerId: providerDbId ?? provider.providerKey,
                    tokenCountInput: inputTokens,
                    tokenCountOutput: outputTokens,
                    estimatedCost: cost,
                    endpointCalled: "/api/ai/chat",
                    responseStatus: 200,
                });
            },
        });

        return new Response(stream, { headers: sseHeaders() }) as unknown as NextResponse;
    }
);
