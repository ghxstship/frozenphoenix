"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatView } from "@/components/messaging/chat-view";
import { ThreadPanel } from "@/components/messaging/thread-panel";
import { NewConversationDialog } from "@/components/messaging/new-conversation-dialog";
import { MessageSearch } from "@/components/messaging/message-search";
import { useMessaging } from "@/hooks/use-messaging";
import {
    useAISummary,
    useConversations,
    useDeleteMessage,
    useEditMessage,
    useMarkRead,
    useMessages,
    useOrgMembers,
    usePinMessage,
    useSendMessage,
    useSendVoiceMessage,
    useToggleReaction,
    useTranslateMessage,
    useUpdateConversation,
} from "@/lib/supabase/hooks-messaging";
import type { AISummaryResult } from "@/lib/supabase/hooks-messaging";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";
import { VoiceMessageRecorder } from "@/components/messaging/voice-message-recorder";
import { AISummaryPanel } from "@/components/messaging/ai-summary-panel";
import { PushToTalkButton } from "@/components/messaging/push-to-talk-button";
import { useAuth } from "@/lib/supabase/auth-context";
import {
    useConversationsRealtime,
    useMessagesRealtime,
    usePresence,
    useTypingIndicator,
} from "@/lib/supabase/hooks-messaging-realtime";
import type { MessageWithSender } from "@/types/messaging";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

export function MessagesPageClient() {
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get("q");
    const [showSearch, setShowSearch] = React.useState(!!urlQuery);

    // Activate search view when ?q= param is present
    React.useEffect(() => {
        if (urlQuery) setShowSearch(true);
    }, [urlQuery]);

    const activeConversationId = useMessaging((s) => s.activeConversationId);
    const setActiveConversation = useMessaging((s) => s.setActiveConversation);
    const view = useMessaging((s) => s.view);
    const setView = useMessaging((s) => s.setView);
    const searchQuery = useMessaging((s) => s.searchQuery);
    const setSearchQuery = useMessaging((s) => s.setSearchQuery);
    const isComposing = useMessaging((s) => s.isComposing);
    const setComposing = useMessaging((s) => s.setComposing);
    const drafts = useMessaging((s) => s.drafts);
    const setDraft = useMessaging((s) => s.setDraft);
    const replyTo = useMessaging((s) => s.replyTo);
    const setReplyTo = useMessaging((s) => s.setReplyTo);
    const setActiveThread = useMessaging((s) => s.setActiveThread);
    const activeThreadId = useMessaging((s) => s.activeThreadId);

    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    // Realtime subscriptions
    useConversationsRealtime();
    useMessagesRealtime(activeConversationId ?? undefined);
    const {
        typingUsers: _typingUsers,
        sendTyping: _sendTyping,
        sendStopTyping: _sendStopTyping,
    } = useTypingIndicator(activeConversationId ?? undefined);
    const { onlineUsers: _onlineUsers } = usePresence();

    const { data: conversations = [], isLoading: convLoading } = useConversations();
    const { data: orgMembers = [] } = useOrgMembers();
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
    const sendVoiceMessage = useSendVoiceMessage();
    const updateConversation = useUpdateConversation(activeConversationId ?? "");
    const aiSummary = useAISummary(activeConversationId ?? undefined);
    const toggleReaction = useToggleReaction();
    const pinMessage = usePinMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();
    const translateMessage = useTranslateMessage();
    const markRead = useMarkRead();

    // Mark last message as read when conversation is opened
    const lastMessageId = messages[0]?.id;
    React.useEffect(() => {
        if (activeConversationId && lastMessageId) {
            markRead.mutate({ messageId: lastMessageId, conversationId: activeConversationId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversationId, lastMessageId]);
    const { voiceEnabled, aiSummaryEnabled } = useMessagingEnabled();
    const [summaryResult, setSummaryResult] = React.useState<AISummaryResult | null>(null);
    const [summaryError, setSummaryError] = React.useState<string | null>(null);
    const [translatingMessageId, setTranslatingMessageId] = React.useState<string | null>(null);
    const [translatedTexts, setTranslatedTexts] = React.useState<Record<string, string>>({});

    const draftKey = activeConversationId ?? "new";

    const handleSend = React.useCallback(
        (payload: { body: string; mentioned_user_ids?: string[] | undefined }) => {
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
        setSummaryResult(null);
        setSummaryError(null);
    }, [setActiveConversation, setView]);

    const handleSendVoice = React.useCallback(
        (blob: Blob, durationSeconds: number) => {
            if (!activeConversationId) return;
            sendVoiceMessage.mutate({
                conversation_id: activeConversationId,
                audio_blob: blob,
                duration_seconds: durationSeconds,
            });
        },
        [activeConversationId, sendVoiceMessage]
    );

    const handleGenerateSummary = React.useCallback(() => {
        setSummaryError(null);
        aiSummary.mutate(undefined, {
            onSuccess: (data) => {
                if (data) setSummaryResult(data);
                else setSummaryError("empty");
            },
            onError: () => setSummaryError("failed"),
        });
    }, [aiSummary]);

    const handleTranslate = React.useCallback(
        (messageId: string, body: string, targetLanguage: string) => {
            setTranslatingMessageId(messageId);
            translateMessage.mutate(
                { messageId, body, targetLanguage },
                {
                    onSuccess: (result) => {
                        if (result) {
                            setTranslatedTexts((prev) => ({
                                ...prev,
                                [messageId]: result.translated_text,
                            }));
                        }
                        setTranslatingMessageId(null);
                    },
                    onError: () => setTranslatingMessageId(null),
                }
            );
        },
        [translateMessage]
    );

    const handleClearTranslation = React.useCallback((messageId: string) => {
        setTranslatedTexts((prev) => {
            const next = { ...prev };
            delete next[messageId];
            return next;
        });
    }, []);

    const voiceRecorderSlot = React.useMemo(
        () =>
            voiceEnabled ? (
                <>
                    <VoiceMessageRecorder onSend={handleSendVoice} />
                    <PushToTalkButton channelName={activeConversation?.name ?? undefined} />
                </>
            ) : null,
        [voiceEnabled, handleSendVoice, activeConversation?.name]
    );

    const handleArchiveConversation = React.useCallback(() => {
        if (!activeConversationId || !activeConversation) return;
        if (
            window.confirm(
                `Archive conversation "${activeConversation.name ?? "this conversation"}"?`
            )
        ) {
            updateConversation.mutate({ is_archived: true } as Parameters<
                typeof updateConversation.mutate
            >[0]);
            setActiveConversation(null);
        }
    }, [activeConversationId, activeConversation, updateConversation, setActiveConversation]);

    const archiveButton = React.useMemo(
        () =>
            activeConversation ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleArchiveConversation}
                    disabled={updateConversation.isPending}
                    aria-label="Archive conversation"
                >
                    Archive
                </Button>
            ) : null,
        [activeConversation, handleArchiveConversation, updateConversation.isPending]
    );

    const aiSummarySlot = React.useMemo(
        () => (
            <>
                {aiSummaryEnabled && (
                    <AISummaryPanel
                        conversationId={activeConversationId ?? undefined}
                        onGenerate={handleGenerateSummary}
                        isGenerating={aiSummary.isPending}
                        result={summaryResult}
                        error={summaryError}
                        onDismiss={() => {
                            setSummaryResult(null);
                            setSummaryError(null);
                        }}
                    />
                )}
                {archiveButton}
            </>
        ),
        [
            aiSummaryEnabled,
            activeConversationId,
            handleGenerateSummary,
            aiSummary.isPending,
            summaryResult,
            summaryError,
            archiveButton,
        ]
    );

    const handleConversationCreated = React.useCallback(
        (conversationId: string) => {
            setComposing(false);
            setActiveConversation(conversationId);
        },
        [setComposing, setActiveConversation]
    );

    const showChatOrThread = !!activeConversationId;

    const handleSearchResultSelect = React.useCallback(
        (result: { conversation_id: string }) => {
            setShowSearch(false);
            setActiveConversation(result.conversation_id);
        },
        [setActiveConversation]
    );

    const config: DashboardPageConfig = React.useMemo(
        () => ({
            resource: "messaging_dm",
            action: "read",
            title: "Messages",
            description: "Conversations, channels, and direct messages",
            searchable: false,
            contentSlot: (
                <div className="h-[calc(100vh-12rem)]">
                    <div className="flex-1 flex border border-border rounded-xl overflow-hidden bg-background h-full">
                        {/* Conversation sidebar — always visible on desktop, hidden when in chat on mobile */}
                        <div
                            className={cn(
                                "w-full lg:w-80 border-r border-border shrink-0",
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
                                !showChatOrThread && !showSearch && "hidden lg:flex"
                            )}
                        >
                            {showSearch && (
                                <MessageSearch
                                    onSelectResult={handleSearchResultSelect}
                                    className="flex-1"
                                />
                            )}

                            {!showSearch && !activeConversationId && (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm">
                                            Select a conversation to start messaging
                                        </p>
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
                                    composerExtraActions={voiceRecorderSlot}
                                    headerExtraContent={aiSummarySlot}
                                    onTranslate={handleTranslate}
                                    translatingMessageId={translatingMessageId}
                                    translatedTexts={translatedTexts}
                                    onClearTranslation={handleClearTranslation}
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
                                        composerExtraActions={voiceRecorderSlot}
                                        headerExtraContent={aiSummarySlot}
                                        onTranslate={handleTranslate}
                                        translatingMessageId={translatingMessageId}
                                        translatedTexts={translatedTexts}
                                        onClearTranslation={handleClearTranslation}
                                        className="flex-1"
                                    />
                                    <div className="hidden lg:block w-80 border-l border-border shrink-0">
                                        <ThreadPanel
                                            parentMessage={threadParentMessage}
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <NewConversationDialog
                        open={isComposing}
                        onClose={() => setComposing(false)}
                        onCreated={handleConversationCreated}
                        members={orgMembers}
                    />
                </div>
            ),
        }),
        [
            showChatOrThread,
            showSearch,
            conversations,
            activeConversationId,
            searchQuery,
            setSearchQuery,
            setActiveConversation,
            isComposing,
            setComposing,
            convLoading,
            handleSearchResultSelect,
            activeConversation,
            messages,
            currentUserId,
            msgLoading,
            hasNextPage,
            fetchNextPage,
            handleSend,
            handleReact,
            handlePin,
            handleEdit,
            handleDelete,
            handleThreadOpen,
            handleReply,
            handleBack,
            replyTo,
            setReplyTo,
            drafts,
            draftKey,
            setDraft,
            voiceRecorderSlot,
            aiSummarySlot,
            handleTranslate,
            translatingMessageId,
            translatedTexts,
            handleClearTranslation,
            view,
            threadParentMessage,
            handleConversationCreated,
            orgMembers,
        ]
    );

    return (
        <OperationalDashboardShell
            config={config}
            data={conversations as unknown as Record<string, unknown>[]}
            isLoading={convLoading}
        />
    );
}
