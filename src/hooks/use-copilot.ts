"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

type CopilotView = "conversations" | "chat";

interface CopilotMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    toolCalls?: Array<{ id: string; name: string; status: "pending" | "done"; result?: string }>;
    isStreaming?: boolean;
}

interface CopilotState {
    // Panel visibility
    isPanelOpen: boolean;
    setPanelOpen: (open: boolean) => void;
    togglePanel: () => void;

    // Active conversation
    activeConversationId: string | null;
    setActiveConversation: (id: string | null) => void;

    // View stack
    view: CopilotView;
    setView: (view: CopilotView) => void;

    // Messages (in-memory for active chat — persisted in DB via conversation-manager)
    messages: CopilotMessage[];
    addMessage: (msg: CopilotMessage) => void;
    updateMessage: (id: string, update: Partial<CopilotMessage>) => void;
    clearMessages: () => void;

    // Streaming state
    isStreaming: boolean;
    setStreaming: (streaming: boolean) => void;

    // Input draft
    draft: string;
    setDraft: (text: string) => void;

    // Model selection
    activeModelId: string | null;
    setActiveModelId: (id: string | null) => void;

    // Suggestions
    suggestions: string[];
    setSuggestions: (suggestions: string[]) => void;

    // Page context (injected by platform context awareness)
    pageContext: { entityType: string; entityId?: string; entityName?: string } | null;
    setPageContext: (
        ctx: { entityType: string; entityId?: string; entityName?: string } | null
    ) => void;

    // Reset
    reset: () => void;
}

const initialState = {
    isPanelOpen: false,
    activeConversationId: null,
    view: "chat" as CopilotView,
    messages: [] as CopilotMessage[],
    isStreaming: false,
    draft: "",
    activeModelId: null,
    suggestions: [] as string[],
    pageContext: null as CopilotState["pageContext"],
};

export const useCopilot = create<CopilotState>()(
    persist(
        (set) => ({
            ...initialState,

            setPanelOpen: (open) => {
                set((s) => (s.isPanelOpen === open ? s : { isPanelOpen: open }));
            },
            togglePanel: () => {
                set((s) => ({ isPanelOpen: !s.isPanelOpen }));
            },

            setActiveConversation: (id) => {
                set({ activeConversationId: id, view: id ? "chat" : "conversations" });
            },

            setView: (view) => {
                set((s) => (s.view === view ? s : { view }));
            },

            addMessage: (msg) => {
                set((s) => ({ messages: [...s.messages, msg] }));
            },
            updateMessage: (id, update) => {
                set((s) => ({
                    messages: s.messages.map((m) => (m.id === id ? { ...m, ...update } : m)),
                }));
            },
            clearMessages: () => {
                set({ messages: [] });
            },

            setStreaming: (streaming) => {
                set((s) => (s.isStreaming === streaming ? s : { isStreaming: streaming }));
            },

            setDraft: (draft) => {
                set((s) => (s.draft === draft ? s : { draft }));
            },

            setActiveModelId: (id) => {
                set({ activeModelId: id });
            },

            setSuggestions: (suggestions) => {
                set({ suggestions });
            },

            setPageContext: (ctx) => {
                set({ pageContext: ctx });
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: "fp-copilot-state",
            partialize: (state) => ({
                activeConversationId: state.activeConversationId,
                activeModelId: state.activeModelId,
            }),
        }
    )
);

export type { CopilotMessage, CopilotState, CopilotView };
