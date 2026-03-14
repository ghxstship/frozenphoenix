"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, MoreHorizontal, Pencil, Pin, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUICK_REACTIONS } from "@/types/messaging";
import type { MessageWithSender, ReactionAggregate } from "@/types/messaging";
import { formatRelativeTime } from "@/lib/locale";

interface MessageBubbleProps {
    message: MessageWithSender;
    isOwn: boolean;
    onReply?: (message: MessageWithSender) => void;
    onReact?: (messageId: string, emoji: string) => void;
    onPin?: (messageId: string, pin: boolean) => void;
    onEdit?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onThreadOpen?: (messageId: string) => void;
    className?: string;
}

export function MessageBubble({
    message,
    isOwn,
    onReply,
    onReact,
    onPin,
    onEdit,
    onDelete,
    onThreadOpen,
    className,
}: MessageBubbleProps) {
    const [showActions, setShowActions] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editText, setEditText] = React.useState(message.body);

    const timeAgo = React.useMemo(
        () => formatRelativeTime(message.created_at),
        [message.created_at]
    );

    const handleEditSave = () => {
        if (editText.trim() && editText.trim() !== message.body) {
            onEdit?.(message.id);
        }
        setIsEditing(false);
    };

    if (message.is_system_message) {
        return (
            <div className="flex justify-center py-1.5">
                <span className="text-xs text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
                    {message.body}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group relative flex gap-2.5 px-4 py-1.5 hover:bg-secondary/30 transition-colors",
                message.is_pinned && "bg-amber-500/5 border-l-2 border-amber-500/40",
                className
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            role="article"
            aria-label={`Message from ${message.sender?.name ?? "Unknown"}`}
        >
            {/* Avatar */}
            <div className="shrink-0 pt-0.5">
                <Avatar
                    name={message.sender?.name}
                    src={message.sender?.avatar_url ?? undefined}
                    size="sm"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        {message.sender?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground" title={message.created_at}>
                        {timeAgo}
                    </span>
                    {message.edited_at && (
                        <span className="text-xs text-muted-foreground italic">(edited)</span>
                    )}
                    {message.is_pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    {message.priority !== "normal" && (
                        <span
                            className={cn(
                                "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                                message.priority === "urgent" && "bg-orange-500/10 text-orange-600",
                                message.priority === "critical" && "bg-red-500/10 text-red-600",
                                message.priority === "high" && "bg-yellow-500/10 text-yellow-600"
                            )}
                        >
                            {message.priority}
                        </span>
                    )}
                </div>

                {/* Body */}
                {isEditing ? (
                    <div className="mt-1">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleEditSave();
                                }
                                if (e.key === "Escape") setIsEditing(false);
                            }}
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-1 mt-1">
                            <button
                                onClick={handleEditSave}
                                className="text-xs text-primary hover:underline"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words mt-0.5">
                        {message.deleted_at ? (
                            <span className="italic text-muted-foreground">
                                This message was deleted
                            </span>
                        ) : (
                            message.body
                        )}
                    </p>
                )}

                {/* Reactions */}
                {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {message.reactions.map((reaction: ReactionAggregate) => (
                            <button
                                key={reaction.emoji}
                                onClick={() => onReact?.(message.id, reaction.emoji)}
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                                    reaction.has_reacted
                                        ? "border-primary/30 bg-primary/10 text-primary"
                                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                )}
                                aria-label={`${reaction.emoji} ${reaction.count} reactions`}
                            >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Thread indicator */}
                {message.thread_message_count > 0 && (
                    <button
                        onClick={() => onThreadOpen?.(message.id)}
                        className="flex items-center gap-1.5 mt-1.5 text-xs text-primary hover:underline"
                    >
                        <MessageSquare className="h-3 w-3" />
                        <span>
                            {message.thread_message_count}{" "}
                            {message.thread_message_count === 1 ? "reply" : "replies"}
                        </span>
                    </button>
                )}
            </div>

            {/* Action bar (on hover) */}
            {showActions && !message.deleted_at && (
                <div className="absolute top-0 right-3 -translate-y-1/2 flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-sm px-1 py-0.5">
                    {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                        <Tooltip
                            key={emoji}
                            content={`React with ${emoji}`}
                            side="top"
                            delayDuration={200}
                        >
                            <button
                                onClick={() => onReact?.(message.id, emoji)}
                                className="h-6 w-6 rounded flex items-center justify-center text-sm hover:bg-secondary transition-colors"
                                aria-label={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        </Tooltip>
                    ))}
                    <Tooltip content="Reply in thread" side="top">
                        <button
                            onClick={() => onReply?.(message)}
                            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Reply in thread"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                    </Tooltip>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Tooltip content="More actions" side="top">
                                <button
                                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    aria-label="More actions"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                            </Tooltip>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {onPin && (
                                <DropdownMenuItem
                                    onClick={() => onPin(message.id, !message.is_pinned)}
                                >
                                    <Pin className="h-3.5 w-3.5 mr-2" />
                                    {message.is_pinned ? "Unpin" : "Pin Message"}
                                </DropdownMenuItem>
                            )}
                            {isOwn && onEdit && (
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {isOwn && onDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(message.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
