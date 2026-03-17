"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Download, Hash, Lock, Megaphone, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { ConversationMembersPanel } from "./conversation-members-panel";
import type { ConversationListItem, MessagePriority, MessageWithSender } from "@/types/messaging";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

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
    composerExtraActions?: React.ReactNode;
    headerExtraContent?: React.ReactNode;
    onTranslate?: (messageId: string, body: string, targetLanguage: string) => void;
    translatingMessageId?: string | null;
    translatedTexts?: Record<string, string>;
    onClearTranslation?: (messageId: string) => void;
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
    composerExtraActions,
    headerExtraContent,
    onTranslate,
    translatingMessageId,
    translatedTexts,
    onClearTranslation,
    className,
}: ChatViewProps) {
    const ms = useMessagingStrings();
    const [showMembers, setShowMembers] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
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
            <div
                className={cn(
                    "flex flex-col items-center justify-center h-full text-center px-6",
                    className
                )}
            >
                <Hash className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{ms("conversations_empty")}</p>
            </div>
        );
    }

    const displayName =
        conversation.name ??
        (conversation.type === "dm" && conversation.members.length > 0
            ? conversation.members.map((m) => m.name).join(", ")
            : "Unnamed");

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <Tooltip content="Back to conversations" side="bottom">
                    <button
                        onClick={onBack}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </Tooltip>

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
                            {ms("chat_members_count", { count: conversation.members.length })}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Tooltip content={ms("members_title")} side="bottom">
                        <button
                            onClick={() => setShowMembers((v) => !v)}
                            className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                                showMembers
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            )}
                            aria-label={ms("members_title")}
                            aria-pressed={showMembers}
                        >
                            <Users className="h-4 w-4" />
                        </button>
                    </Tooltip>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                aria-label={ms("export_title")}
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!conversation || isExporting) return;
                                    setIsExporting(true);
                                    fetch(`/api/conversations/${conversation.id}/export?format=csv`)
                                        .then((r) => r.blob())
                                        .then((blob) => {
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `${(conversation.name ?? "conversation").replace(/[^a-zA-Z0-9-_]/g, "_")}-export.csv`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        })
                                        .finally(() => setIsExporting(false));
                                }}
                            >
                                {ms("export_csv")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!conversation || isExporting) return;
                                    setIsExporting(true);
                                    fetch(
                                        `/api/conversations/${conversation.id}/export?format=json`
                                    )
                                        .then((r) => r.blob())
                                        .then((blob) => {
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `${(conversation.name ?? "conversation").replace(/[^a-zA-Z0-9-_]/g, "_")}-export.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        })
                                        .finally(() => setIsExporting(false));
                                }}
                            >
                                {ms("export_json")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Phase 3: AI Summary / extra header content */}
            {headerExtraContent}

            {/* Content row: messages + optional members sidebar */}
            <div className="flex-1 flex min-h-0">
                {/* Messages column */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto"
                        onScroll={handleScroll}
                        role="log"
                        aria-label={ms("a11y_message_list")}
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
                                    {ms("chat_no_messages")}
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
                                    onTranslate={onTranslate}
                                    translatingMessageId={translatingMessageId}
                                    translatedTexts={translatedTexts}
                                    onClearTranslation={onClearTranslation}
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
                        extraActions={composerExtraActions}
                    />
                </div>

                {/* Members sidebar */}
                {showMembers && conversation && (
                    <div className="w-64 border-l border-border shrink-0 hidden md:block">
                        <ConversationMembersPanel
                            conversationId={conversation.id}
                            conversationType={conversation.type}
                            onClose={() => setShowMembers(false)}
                            className="h-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
