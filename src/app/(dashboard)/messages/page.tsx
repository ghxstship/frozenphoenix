"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatView } from "@/components/messaging/chat-view";
import { ThreadPanel } from "@/components/messaging/thread-panel";
import { useMessaging } from "@/hooks/use-messaging";
import { useConversations, useDeleteMessage, useEditMessage, useMessages, usePinMessage, useSendMessage, useToggleReaction } from "@/lib/supabase/hooks-messaging";
import { useAuth } from "@/lib/supabase/auth-context";
import type { MessageWithSender } from "@/types/messaging";

export default function MessagesPage() {
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
    const activeThreadId = useMessaging((s) => s.activeThreadId);

    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    const { data: conversations = [], isLoading: convLoading } = useConversations();
    const {
        data: messagesPages,
        isLoading: msgLoading,
        hasNextPage,
        fetchNextPage,
    } = useMessages(activeConversationId ?? undefined);

    const messages: MessageWithSender[] = React.useMemo(() => {
        if (!messagesPages?.pages) return [];
        return messagesPages.pages.flat();
    }, [messagesPages]);

    const activeConversation = React.useMemo(
        () => conversations.find((c) => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );

    const threadParentMessage = React.useMemo(
        () => messages.find((m) => m.id === activeThreadId) ?? null,
        [messages, activeThreadId]
    );

    const sendMessage = useSendMessage();
    const toggleReaction = useToggleReaction();
    const pinMessage = usePinMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();

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
            if (msg) editMessage.mutate({ messageId, body: msg.body });
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

    const handleBack = React.useCallback(() => {
        setActiveConversation(null);
        setView("conversations");
    }, [setActiveConversation, setView]);

    const showChatOrThread = !!activeConversationId;

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
            <PageHeader
                title="Messages"
                description="Conversations, channels, and direct messages"
            />

            <div className="flex-1 flex border border-border rounded-xl overflow-hidden bg-background mt-4">
                {/* Conversation sidebar — always visible on desktop, hidden when in chat on mobile */}
                <div
                    className={cn(
                        "w-80 border-r border-border shrink-0",
                        showChatOrThread ? "hidden lg:block" : "block"
                    )}
                >
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversationId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSelect={(id) => setActiveConversation(id)}
                        onCompose={() => setComposing(true)}
                        isLoading={convLoading}
                        className="h-full"
                    />
                </div>

                {/* Main content area */}
                <div
                    className={cn(
                        "flex-1 flex",
                        !showChatOrThread && "hidden lg:flex"
                    )}
                >
                    {!activeConversationId && (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}

                    {activeConversationId && view !== "thread" && (
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
                            className="flex-1"
                        />
                    )}

                    {view === "thread" && (
                        <div className="flex flex-1">
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
                                className="flex-1"
                            />
                            <div className="w-80 border-l border-border shrink-0">
                                <ThreadPanel
                                    parentMessage={threadParentMessage}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
