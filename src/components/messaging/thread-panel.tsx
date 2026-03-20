"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { useMessaging } from "@/hooks/use-messaging";
import {
    useDeleteMessage,
    useEditMessage,
    usePinMessage,
    useSendMessage,
    useThreadMessages,
    useToggleReaction,
} from "@/lib/supabase/hooks-messaging";
import { useAuth } from "@/lib/supabase/auth-context";
import type { MessageWithSender } from "@/types/messaging";
import { formatRelativeTime } from "@/lib/locale";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface ThreadPanelProps {
    parentMessage: MessageWithSender | null;
    className?: string;
}

export function ThreadPanel({ parentMessage, className }: ThreadPanelProps) {
    const setActiveThread = useMessaging((s) => s.setActiveThread);
    const activeConversationId = useMessaging((s) => s.activeConversationId);
    const drafts = useMessaging((s) => s.drafts);
    const setDraft = useMessaging((s) => s.setDraft);

    const ms = useMessagingStrings();

    const { user } = useAuth();
    const currentUserId = user?.id ?? "";

    const { data: threadMessages = [], isLoading } = useThreadMessages(parentMessage?.id);

    const sendMessage = useSendMessage();
    const toggleReaction = useToggleReaction();
    const pinMessage = usePinMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [threadMessages.length]);

    const draftKey = `thread-${parentMessage?.id ?? "none"}`;

    const handleSend = React.useCallback(
        (payload: { body: string; mentioned_user_ids?: string[] }) => {
            if (!activeConversationId || !parentMessage) return;
            sendMessage.mutate({
                conversation_id: activeConversationId,
                body: payload.body,
                mentioned_user_ids: payload.mentioned_user_ids,
                parent_message_id: parentMessage.id,
            });
        },
        [activeConversationId, parentMessage, sendMessage]
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
            const msg = threadMessages.find((m) => m.id === messageId);
            if (msg) editMessage.mutate({ messageId, body: msg.body });
        },
        [threadMessages, editMessage]
    );

    const handleDelete = React.useCallback(
        (messageId: string) => {
            deleteMessage.mutate({ messageId });
        },
        [deleteMessage]
    );

    if (!parentMessage) return null;

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <Tooltip content={ms("thread_back")} side="bottom">
                    <button
                        onClick={() => setActiveThread(null)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label={ms("thread_back")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </Tooltip>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{ms("thread_title")}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {parentMessage.sender?.name ?? "Unknown"} &middot;{" "}
                        {formatRelativeTime(parentMessage.created_at)}
                    </p>
                </div>
            </div>

            {/* Parent message */}
            <div className="border-b border-border bg-secondary/20">
                <MessageBubble
                    message={parentMessage}
                    isOwn={parentMessage.sender_id === currentUserId}
                    onReact={handleReact}
                    onPin={handlePin}
                />
            </div>

            {/* Reply count */}
            {threadMessages.length > 0 && (
                <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
                    {ms("thread_replies", { count: threadMessages.length })}
                </div>
            )}

            {/* Thread messages */}
            <div
                className="flex-1 overflow-y-auto"
                role="log"
                aria-label={ms("thread_replies", { count: threadMessages.length })}
            >
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary motion-safe:animate-spin" />
                    </div>
                )}

                <div className="py-2">
                    {threadMessages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === currentUserId}
                            onReact={handleReact}
                            onPin={handlePin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <MessageComposer
                onSend={handleSend}
                placeholder={ms("thread_reply_placeholder")}
                draft={drafts[draftKey] ?? ""}
                onDraftChange={(text) => setDraft(draftKey, text)}
            />
        </div>
    );
}
