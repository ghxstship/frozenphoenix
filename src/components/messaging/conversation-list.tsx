"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Hash, Lock, Megaphone, Plus, Search, Users } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { ConversationListItem } from "@/types/messaging";
import { formatRelativeTime } from "@/lib/locale";

interface ConversationListProps {
    conversations: ConversationListItem[];
    activeId: string | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelect: (id: string) => void;
    onCompose: () => void;
    isLoading?: boolean;
    className?: string;
}

export function ConversationList({
    conversations,
    activeId,
    searchQuery,
    onSearchChange,
    onSelect,
    onCompose,
    isLoading = false,
    className,
}: ConversationListProps) {
    const filtered = React.useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter((c) => {
            const name = getConversationDisplayName(c).toLowerCase();
            return name.includes(q);
        });
    }, [conversations, searchQuery]);

    // Separate pinned from unpinned
    const pinned = filtered.filter((c) => c.my_membership?.is_pinned);
    const unpinned = filtered.filter((c) => !c.my_membership?.is_pinned);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Messages</h2>
                <Tooltip content="New conversation" side="bottom">
                    <button
                        onClick={onCompose}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="New conversation"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </Tooltip>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full rounded-md border border-border bg-secondary/30 pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                        aria-label="Search conversations"
                    />
                </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Conversations">
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-16 rounded-lg bg-secondary/30 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? "No matching conversations" : "No conversations yet"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={onCompose}
                                className="mt-2 text-xs text-primary hover:underline"
                            >
                                Start a conversation
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {pinned.length > 0 && (
                            <div>
                                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Pinned
                                </div>
                                {pinned.map((conv) => (
                                    <ConversationItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={conv.id === activeId}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        )}
                        {unpinned.length > 0 && (
                            <div>
                                {pinned.length > 0 && (
                                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Recent
                                    </div>
                                )}
                                {unpinned.map((conv) => (
                                    <ConversationItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={conv.id === activeId}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Conversation Item ───────────────────────────────────────

interface ConversationItemProps {
    conversation: ConversationListItem;
    isActive: boolean;
    onSelect: (id: string) => void;
}

function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
    const displayName = getConversationDisplayName(conversation);
    const lastMessage = conversation.last_message;
    const hasUnread = conversation.unread_count > 0;

    const timeLabel = lastMessage ? formatRelativeTime(lastMessage.created_at) : null;

    return (
        <button
            onClick={() => onSelect(conversation.id)}
            className={cn(
                "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                isActive
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-secondary/50 border-l-2 border-transparent",
                hasUnread && !isActive && "bg-secondary/20"
            )}
            role="option"
            aria-selected={isActive}
            aria-label={`${displayName}${hasUnread ? `, ${conversation.unread_count} unread` : ""}`}
        >
            {/* Icon or avatar */}
            <div className="shrink-0 pt-0.5">
                {conversation.type === "channel" ? (
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                        <ConversationIcon conversation={conversation} />
                    </div>
                ) : (
                    <Avatar
                        name={displayName}
                        src={conversation.members[0]?.avatar_url ?? undefined}
                        size="sm"
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <span
                        className={cn(
                            "text-sm truncate",
                            hasUnread
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground/80"
                        )}
                    >
                        {displayName}
                    </span>
                    {timeLabel && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                            {timeLabel}
                        </span>
                    )}
                </div>
                {lastMessage && (
                    <p
                        className={cn(
                            "text-xs truncate mt-0.5",
                            hasUnread ? "text-foreground/70 font-medium" : "text-muted-foreground"
                        )}
                    >
                        {lastMessage.is_system_message
                            ? lastMessage.body
                            : `${lastMessage.sender_name}: ${lastMessage.body}`}
                    </p>
                )}
            </div>

            {/* Unread badge */}
            {hasUnread && (
                <div className="shrink-0 mt-1">
                    <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                        {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                    </span>
                </div>
            )}
        </button>
    );
}

// ─── Helpers ─────────────────────────────────────────────────

function ConversationIcon({ conversation }: { conversation: ConversationListItem }) {
    if (conversation.is_announcement_only)
        return <Megaphone className="h-4 w-4 text-muted-foreground" />;
    if (!conversation.is_public) return <Lock className="h-3.5 w-3.5 text-muted-foreground" />;
    return <Hash className="h-4 w-4 text-muted-foreground" />;
}

function getConversationDisplayName(conversation: ConversationListItem): string {
    if (conversation.name) return conversation.name;
    if (conversation.type === "dm" && conversation.members.length > 0) {
        return conversation.members.map((m) => m.name).join(", ");
    }
    return "Unnamed Conversation";
}
