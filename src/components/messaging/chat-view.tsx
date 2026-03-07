"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Hash, Lock, Megaphone, Settings, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import type { ConversationListItem, MessagePriority, MessageWithSender } from "@/types/messaging";

interface ChatViewProps {
    conversation: ConversationListItem | null;
    messages: MessageWithSender[];
    currentUserId: string;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onSend: (payload: {
        body: string;
        mentioned_user_ids?: string[];
        priority?: MessagePriority;
    }) => void;
    onReact: (messageId: string, emoji: string) => void;
    onPin: (messageId: string, pin: boolean) => void;
    onEdit: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    onThreadOpen: (messageId: string) => void;
    onReply: (message: MessageWithSender) => void;
    onBack: () => void;
    replyTo?: { messageId: string; body: string; senderName: string } | null;
    onCancelReply?: () => void;
    draft?: string;
    onDraftChange?: (text: string) => void;
    className?: string;
}

export function ChatView({
    conversation,
    messages,
    currentUserId,
    isLoading = false,
    hasMore = false,
    onLoadMore,
    onSend,
    onReact,
    onPin,
    onEdit,
    onDelete,
    onThreadOpen,
    onReply,
    onBack,
    replyTo,
    onCancelReply,
    draft,
    onDraftChange,
    className,
}: ChatViewProps) {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // Infinite scroll: load more when scrolling to top
    const handleScroll = React.useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || !hasMore || isLoading) return;
        if (container.scrollTop < 100) {
            onLoadMore?.();
        }
    }, [hasMore, isLoading, onLoadMore]);

    if (!conversation) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full text-center px-6", className)}>
                <Hash className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                    Select a conversation to start messaging
                </p>
            </div>
        );
    }

    const displayName = conversation.name
        ?? (conversation.type === "dm" && conversation.members.length > 0
            ? conversation.members.map((m) => m.name).join(", ")
            : "Unnamed");

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <button
                    onClick={onBack}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden"
                    aria-label="Back to conversations"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                {conversation.type === "channel" ? (
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        {conversation.is_announcement_only ? (
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                        ) : !conversation.is_public ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <Hash className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                ) : (
                    <Avatar
                        name={displayName}
                        src={conversation.members[0]?.avatar_url ?? undefined}
                        size="sm"
                    />
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{displayName}</h3>
                    {conversation.type === "channel" && conversation.description && (
                        <p className="text-xs text-muted-foreground truncate">
                            {conversation.description}
                        </p>
                    )}
                    {conversation.type === "group" && conversation.members.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {conversation.members.length} members
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="View members"
                    >
                        <Users className="h-4 w-4" />
                    </button>
                    <button
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Conversation settings"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto"
                onScroll={handleScroll}
                role="log"
                aria-label="Messages"
                aria-live="polite"
            >
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    </div>
                )}

                {!isLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <p className="text-sm text-muted-foreground">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                )}

                <div className="py-2">
                    {/* Messages rendered oldest-first (API returns desc, so reversed) */}
                    {[...messages].reverse().map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === currentUserId}
                            onReply={() => onReply(message)}
                            onReact={onReact}
                            onPin={onPin}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onThreadOpen={onThreadOpen}
                        />
                    ))}
                </div>

                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <MessageComposer
                onSend={onSend}
                replyTo={replyTo}
                onCancelReply={onCancelReply}
                draft={draft}
                onDraftChange={onDraftChange}
                placeholder={`Message ${conversation.type === "channel" ? "#" : ""}${displayName}`}
            />
        </div>
    );
}
