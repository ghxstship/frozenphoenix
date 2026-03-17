"use client";

import * as React from "react";
import { SlidePanel } from "@/components/ui/slide-panel";
import { ConversationList } from "./conversation-list";
import { ChatView } from "./chat-view";
import { ThreadPanel } from "./thread-panel";
import { NewConversationDialog } from "./new-conversation-dialog";
import { useMessaging } from "@/hooks/use-messaging";
import {
    useAISummary,
    useConversations,
    useDeleteMessage,
    useEditMessage,
    useMessages,
    useOrgMembers,
    usePinMessage,
    useSendMessage,
    useSendVoiceMessage,
    useToggleReaction,
} from "@/lib/supabase/hooks-messaging";
import type { AISummaryResult } from "@/lib/supabase/hooks-messaging";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";
import { VoiceMessageRecorder } from "./voice-message-recorder";
import { AISummaryPanel } from "./ai-summary-panel";
import { useAuth } from "@/lib/supabase/auth-context";
import {
    useConversationsRealtime,
    useMessagesRealtime,
} from "@/lib/supabase/hooks-messaging-realtime";
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
    const isComposing = useMessaging((s) => s.isComposing);
    const setComposing = useMessaging((s) => s.setComposing);
    const drafts = useMessaging((s) => s.drafts);
    const setDraft = useMessaging((s) => s.setDraft);
    const replyTo = useMessaging((s) => s.replyTo);
    const setReplyTo = useMessaging((s) => s.setReplyTo);
    const setActiveThread = useMessaging((s) => s.setActiveThread);

    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    // Realtime subscriptions
    useConversationsRealtime();
    useMessagesRealtime(activeConversationId ?? undefined);

    // Data hooks
    const { data: conversations = [], isLoading: convLoading } = useConversations();
    const { data: orgMembers = [] } = useOrgMembers();
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
    const sendVoiceMessage = useSendVoiceMessage();
    const aiSummary = useAISummary(activeConversationId ?? undefined);
    const toggleReaction = useToggleReaction();
    const pinMessage = usePinMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();
    const { voiceEnabled, aiSummaryEnabled } = useMessagingEnabled();
    const [summaryResult, setSummaryResult] = React.useState<AISummaryResult | null>(null);
    const [summaryError, setSummaryError] = React.useState<string | null>(null);

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

    const voiceRecorderSlot = voiceEnabled ? (
        <VoiceMessageRecorder onSend={handleSendVoice} />
    ) : null;

    const aiSummarySlot = aiSummaryEnabled ? (
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
    ) : null;

    const handleConversationCreated = React.useCallback(
        (conversationId: string) => {
            setComposing(false);
            setActiveConversation(conversationId);
        },
        [setComposing, setActiveConversation]
    );

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
                        composerExtraActions={voiceRecorderSlot}
                        headerExtraContent={aiSummarySlot}
                        className="w-full"
                    />
                )}
                {view === "thread" && (
                    <ThreadPanel parentMessage={threadParentMessage} className="w-full" />
                )}
            </div>

            <NewConversationDialog
                open={isComposing}
                onClose={() => setComposing(false)}
                onCreated={handleConversationCreated}
                members={orgMembers}
            />
        </SlidePanel>
    );
}
