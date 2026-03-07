"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

type MessagingView = "conversations" | "chat" | "thread";

interface MessagingState {
    // Panel visibility
    isPanelOpen: boolean;
    setPanelOpen: (open: boolean) => void;
    togglePanel: () => void;

    // Active conversation
    activeConversationId: string | null;
    setActiveConversation: (id: string | null) => void;

    // Thread
    activeThreadId: string | null;
    setActiveThread: (id: string | null) => void;

    // View stack
    view: MessagingView;
    setView: (view: MessagingView) => void;

    // Compose
    isComposing: boolean;
    setComposing: (composing: boolean) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Entity context (for record-scoped messages)
    entityContext: { type: string; id: string } | null;
    setEntityContext: (ctx: { type: string; id: string } | null) => void;

    // Draft messages (keyed by conversation or entity)
    drafts: Record<string, string>;
    setDraft: (key: string, text: string) => void;
    clearDraft: (key: string) => void;

    // Reply-to
    replyTo: { messageId: string; body: string; senderName: string } | null;
    setReplyTo: (reply: { messageId: string; body: string; senderName: string } | null) => void;

    // Reset
    reset: () => void;
}

const initialState = {
    isPanelOpen: false,
    activeConversationId: null,
    activeThreadId: null,
    view: "conversations" as MessagingView,
    isComposing: false,
    searchQuery: "",
    entityContext: null,
    drafts: {} as Record<string, string>,
    replyTo: null,
};

export const useMessaging = create<MessagingState>()(
    persist(
        (set) => ({
            ...initialState,

            setPanelOpen: (open) =>
                set((state) => (state.isPanelOpen === open ? state : { isPanelOpen: open })),

            togglePanel: () =>
                set((state) => ({ isPanelOpen: !state.isPanelOpen })),

            setActiveConversation: (id) =>
                set((state) => {
                    if (state.activeConversationId === id) return state;
                    return {
                        activeConversationId: id,
                        activeThreadId: null,
                        view: id ? "chat" : "conversations",
                        replyTo: null,
                    };
                }),

            setActiveThread: (id) =>
                set((state) => {
                    if (state.activeThreadId === id) return state;
                    return {
                        activeThreadId: id,
                        view: id ? "thread" : "chat",
                    };
                }),

            setView: (view) =>
                set((state) => (state.view === view ? state : { view })),

            setComposing: (composing) =>
                set((state) => (state.isComposing === composing ? state : { isComposing: composing })),

            setSearchQuery: (query) =>
                set((state) => (state.searchQuery === query ? state : { searchQuery: query })),

            setEntityContext: (ctx) =>
                set({ entityContext: ctx }),

            setDraft: (key, text) =>
                set((state) => {
                    if (state.drafts[key] === text) return state;
                    return { drafts: { ...state.drafts, [key]: text } };
                }),

            clearDraft: (key) =>
                set((state) => {
                    if (!(key in state.drafts)) return state;
                    const { [key]: _removed, ...rest } = state.drafts;
                    void _removed;
                    return { drafts: rest };
                }),

            setReplyTo: (reply) =>
                set({ replyTo: reply }),

            reset: () => set(initialState),
        }),
        {
            name: "messaging-state",
            partialize: (state) => ({
                drafts: state.drafts,
                activeConversationId: state.activeConversationId,
            }),
        }
    )
);
