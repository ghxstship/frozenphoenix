"use client";

import * as React from "react";
import { csrfHeaders } from "@/lib/csrf";
import { cn } from "@/lib/utils";
import { SlidePanel } from "@/components/ui/slide-panel";
import { useCopilot } from "@/hooks/use-copilot";
import type { CopilotMessage as CopilotMessageType } from "@/hooks/use-copilot";
import { CopilotMessage } from "./copilot-message";
import { CopilotInput } from "./copilot-input";
import { CopilotSuggestions, getDefaultSuggestions } from "./copilot-suggestions";
import { ModelBadge } from "./model-badge";
import { Bot, Plus, Sparkles } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

// ─── Main Panel ──────────────────────────────────────────────

export function CopilotPanel() {
    const isPanelOpen = useCopilot((s) => s.isPanelOpen);
    const setPanelOpen = useCopilot((s) => s.setPanelOpen);
    const messages = useCopilot((s) => s.messages);
    const addMessage = useCopilot((s) => s.addMessage);
    const updateMessage = useCopilot((s) => s.updateMessage);
    const isStreaming = useCopilot((s) => s.isStreaming);
    const setStreaming = useCopilot((s) => s.setStreaming);
    const draft = useCopilot((s) => s.draft);
    const setDraft = useCopilot((s) => s.setDraft);
    const clearMessages = useCopilot((s) => s.clearMessages);
    const pageContext = useCopilot((s) => s.pageContext);
    const suggestions = useCopilot((s) => s.suggestions);
    const setSuggestions = useCopilot((s) => s.setSuggestions);

    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const abortRef = React.useRef<AbortController | null>(null);

    // Scroll to bottom on new messages
    const lastMessageContent = messages[messages.length - 1]?.content;
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, lastMessageContent]);

    // Set default suggestions when conversation is empty
    React.useEffect(() => {
        if (messages.length === 0) {
            setSuggestions(getDefaultSuggestions(pageContext));
        }
    }, [messages.length, pageContext, setSuggestions]);

    const handleSubmit = React.useCallback(
        async (content: string) => {
            if (isStreaming) return;

            // Clear suggestions after first message
            setSuggestions([]);

            // Add user message
            const userMsg: CopilotMessageType = {
                id: `user-${Date.now()}`,
                role: "user",
                content,
                timestamp: Date.now(),
            };
            addMessage(userMsg);
            setDraft("");

            // Add placeholder assistant message
            const assistantId = `assistant-${Date.now()}`;
            const assistantMsg: CopilotMessageType = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: Date.now(),
                isStreaming: true,
            };
            addMessage(assistantMsg);
            setStreaming(true);

            // Start streaming from API
            const controller = new AbortController();
            abortRef.current = controller;

            let accumulated = "";
            try {
                const res = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({
                        message: content,
                        conversation_id: useCopilot.getState().activeConversationId,
                        model_id: useCopilot.getState().activeModelId,
                        page_context: pageContext,
                    }),
                    signal: controller.signal,
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({ error: "Request failed" }));
                    updateMessage(assistantId, {
                        content: `Sorry, I encountered an error: ${err.error ?? res.statusText}`,
                        isStreaming: false,
                    });
                    setStreaming(false);
                    return;
                }

                const reader = res.body?.getReader();
                if (!reader) {
                    updateMessage(assistantId, {
                        content: "No response received.",
                        isStreaming: false,
                    });
                    setStreaming(false);
                    return;
                }

                const decoder = new TextDecoder();
                const toolCalls: CopilotMessageType["toolCalls"] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    const lines = text.split("\n");

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const payload = line.slice(6).trim();
                        if (payload === "[DONE]") break;

                        try {
                            const chunk = JSON.parse(payload);

                            if (chunk.delta) {
                                accumulated += chunk.delta;
                                updateMessage(assistantId, { content: accumulated });
                            }

                            if (chunk.tool_call) {
                                const existing = toolCalls?.find(
                                    (t) => t.id === chunk.tool_call.id
                                );
                                if (existing) {
                                    existing.status = "done";
                                } else {
                                    toolCalls?.push({
                                        id: chunk.tool_call.id,
                                        name: chunk.tool_call.name,
                                        status: chunk.tool_call.arguments?._result
                                            ? "done"
                                            : "pending",
                                    });
                                }
                                updateMessage(assistantId, { toolCalls: [...(toolCalls ?? [])] });
                            }
                        } catch {
                            // Skip malformed chunks
                        }
                    }
                }

                updateMessage(assistantId, { isStreaming: false });
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    updateMessage(assistantId, {
                        content:
                            accumulated.length > 0
                                ? accumulated
                                : "Sorry, something went wrong. Please try again.",
                        isStreaming: false,
                    });
                }
            } finally {
                setStreaming(false);
                abortRef.current = null;
            }
        },
        [
            isStreaming,
            addMessage,
            updateMessage,
            setStreaming,
            setDraft,
            pageContext,
            setSuggestions,
        ]
    );

    const handleStop = React.useCallback(() => {
        abortRef.current?.abort();
        setStreaming(false);
    }, [setStreaming]);

    const handleNewConversation = React.useCallback(() => {
        clearMessages();
        setDraft("");
        setSuggestions(getDefaultSuggestions(pageContext));
    }, [clearMessages, setDraft, setSuggestions, pageContext]);

    const handleSuggestionSelect = React.useCallback(
        (suggestion: string) => {
            handleSubmit(suggestion);
        },
        [handleSubmit]
    );

    return (
        <SlidePanel
            open={isPanelOpen}
            onClose={() => setPanelOpen(false)}
            side="right"
            width="max-w-md"
        >
            <div className="flex flex-col h-full -m-6">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">Copilot</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <ModelBadge modelName="Claude Sonnet" providerName="Anthropic" />
                        <Tooltip content="New conversation" side="bottom">
                            <button
                                onClick={handleNewConversation}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                aria-label="New conversation"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Messages area */}
                <div
                    className="flex-1 overflow-y-auto"
                    role="log"
                    aria-label="Copilot conversation"
                    aria-live="polite"
                >
                    {messages.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="py-2">
                            {messages.map((msg) => (
                                <CopilotMessage key={msg.id} message={msg} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Suggestions (shown when conversation is empty or after assistant replies) */}
                {!isStreaming && suggestions.length > 0 && (
                    <CopilotSuggestions
                        suggestions={suggestions}
                        onSelect={handleSuggestionSelect}
                    />
                )}

                {/* Input */}
                <CopilotInput
                    value={draft}
                    onChange={setDraft}
                    onSubmit={handleSubmit}
                    onStop={handleStop}
                    isStreaming={isStreaming}
                />
            </div>
        </SlidePanel>
    );
}

// ─── Empty State ─────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <Bot className="h-7 w-7 text-violet-500/70" />
            </div>
            <h3 className="text-sm font-semibold mb-1">FrozenPhoenix Copilot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
                Ask questions about your projects, tasks, budgets, crew, and more. I can search
                data, generate documents, and help you navigate the platform.
            </p>
        </div>
    );
}

// ─── Copilot Trigger Button (for topbar/sidebar) ────────────

interface CopilotButtonProps {
    className?: string;
}

export function CopilotButton({ className }: CopilotButtonProps) {
    const togglePanel = useCopilot((s) => s.togglePanel);

    return (
        <Tooltip content="Open Copilot (⌘K)" side="bottom">
            <button
                onClick={togglePanel}
                className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    "transition-colors relative",
                    className
                )}
                aria-label="Toggle AI Copilot"
            >
                <Sparkles className="h-4 w-4" />
            </button>
        </Tooltip>
    );
}
