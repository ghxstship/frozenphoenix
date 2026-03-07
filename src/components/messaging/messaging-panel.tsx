"use client";

import * as React from "react";
import { SlidePanel } from "@/components/ui/slide-panel";
import { ConversationList } from "./conversation-list";
import { ChatView } from "./chat-view";
import { ThreadPanel } from "./thread-panel";
import { useMessaging } from "@/hooks/use-messaging";
import { useConversations, useDeleteMessage, useEditMessage, useMessages, usePinMessage, useSendMessage, useToggleReaction } from "@/lib/supabase/hooks-messaging";
import { useAuth } from "@/lib/supabase/auth-context";
import type { MessageWithSender } from "@/types/messaging";

export function MessagingPanel() {
    const isPanelOpen = useMessaging((s) => s.isPanelOpen);
    const setPanelOpen = useMessaging((s) => s.setPanelOpen);
    const activeConversationId = useMessaging((s) => s.activeConversationId);
    const setActiveConversation = useMessaging((s) => s.setActiveConversation);
    const view = useMessaging((s) => s.view);
    const setView = useMessaging((s) => s.setView);
    const searchQuery = useMessaging((s) => s.searchQuery);
    const setSearchQuery = useMessaging((s) => s.setSearchQuery);
    const setComposing = useMessaging((s) => s.setComposing);
    const drafts = useMessaging((s) => s.drafts);
    const setDraft = useMessaging((s) => s.setDraft);
    const replyTo = useMessaging((s) => s.replyTo);
    const setReplyTo = useMessaging((s) => s.setReplyTo);
    const setActiveThread = useMessaging((s) => s.setActiveThread);

    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    // Data hooks
    const { data: conversations = [], isLoading: convLoading } = useConversations();
    const {
        data: messagesPages,
        isLoading: msgLoading,
        hasNextPage,
        fetchNextPage,
    } = useMessages(activeConversationId ?? undefined);

    // Flatten paginated messages (each page is MessageWithSender[])
    const messages: MessageWithSender[] = React.useMemo(() => {
        if (!messagesPages?.pages) return [];
        return messagesPages.pages.flat();
    }, [messagesPages]);

    // Find active conversation object
    const activeConversation = React.useMemo(
        () => conversations.find((c) => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );

    // Mutations
    const sendMessage = useSendMessage();
    const toggleReaction = useToggleReaction();
    const pinMessage = usePinMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();

    // Draft key
    const draftKey = activeConversationId ?? "new";

    const handleSend = React.useCallback(
        (payload: { body: string; mentioned_user_ids?: string[] }) => {
            if (!activeConversationId) return;
            sendMessage.mutate({
                conversation_id: activeConversationId,
                body: payload.body,
                mentioned_user_ids: payload.mentioned_user_ids,
                parent_message_id: replyTo?.messageId,
            });
            setReplyTo(null);
        },
        [activeConversationId, sendMessage, replyTo, setReplyTo]
    );

    const handleReact = React.useCallback(
        (messageId: string, emoji: string) => {
            toggleReaction.mutate({ messageId, emoji });
        },
        [toggleReaction]
    );

    const handlePin = React.useCallback(
        (messageId: string, pin: boolean) => {
            pinMessage.mutate({ messageId, pin });
        },
        [pinMessage]
    );

    const handleEdit = React.useCallback(
        (messageId: string) => {
            const msg = messages.find((m) => m.id === messageId);
            if (msg) {
                editMessage.mutate({ messageId, body: msg.body });
            }
        },
        [messages, editMessage]
    );

    const handleDelete = React.useCallback(
        (messageId: string) => {
            deleteMessage.mutate({ messageId });
        },
        [deleteMessage]
    );

    const handleReply = React.useCallback(
        (message: MessageWithSender) => {
            setReplyTo({
                messageId: message.id,
                body: message.body,
                senderName: message.sender?.name ?? "Unknown",
            });
        },
        [setReplyTo]
    );

    const handleThreadOpen = React.useCallback(
        (messageId: string) => {
            setActiveThread(messageId);
        },
        [setActiveThread]
    );

    // Find parent message for thread view
    const activeThreadId = useMessaging((s) => s.activeThreadId);
    const threadParentMessage = React.useMemo(
        () => messages.find((m) => m.id === activeThreadId) ?? null,
        [messages, activeThreadId]
    );

    const handleBack = React.useCallback(() => {
        setActiveConversation(null);
        setView("conversations");
    }, [setActiveConversation, setView]);

    return (
        <SlidePanel
            open={isPanelOpen}
            onClose={() => setPanelOpen(false)}
            side="right"
            width="max-w-md"
        >
            <div className="flex h-full -m-6">
                {view === "conversations" && (
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversationId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSelect={(id) => setActiveConversation(id)}
                        onCompose={() => setComposing(true)}
                        isLoading={convLoading}
                        className="w-full"
                    />
                )}
                {view === "chat" && (
                    <ChatView
                        conversation={activeConversation}
                        messages={messages}
                        currentUserId={currentUserId}
                        isLoading={msgLoading}
                        hasMore={hasNextPage}
                        onLoadMore={() => fetchNextPage()}
                        onSend={handleSend}
                        onReact={handleReact}
                        onPin={handlePin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onThreadOpen={handleThreadOpen}
                        onReply={handleReply}
                        onBack={handleBack}
                        replyTo={replyTo}
                        onCancelReply={() => setReplyTo(null)}
                        draft={drafts[draftKey] ?? ""}
                        onDraftChange={(text) => setDraft(draftKey, text)}
                        className="w-full"
                    />
                )}
                {view === "thread" && (
                    <ThreadPanel
                        parentMessage={threadParentMessage}
                        className="w-full"
                    />
                )}
            </div>
        </SlidePanel>
    );
}
