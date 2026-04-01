"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Globe, MessageSquare, MoreHorizontal, Pencil, Pin, Trash2 } from "lucide-react";
import { VoiceMessagePlayer } from "./voice-message-player";
import { Tooltip } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUICK_REACTIONS } from "@/types/messaging";
import type { MessageWithSender, ReactionAggregate } from "@/types/messaging";
import { formatRelativeTime } from "@/lib/formatters/locale";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface MessageBubbleProps {
    message: MessageWithSender;
    isOwn: boolean;
    onReply?: ((message: MessageWithSender) => void) | undefined;
    onReact?: ((messageId: string, emoji: string) => void) | undefined;
    onPin?: ((messageId: string, pin: boolean) => void) | undefined;
    onEdit?: ((messageId: string) => void) | undefined;
    onDelete?: ((messageId: string) => void) | undefined;
    onThreadOpen?: ((messageId: string) => void) | undefined;
    onTranslate?: ((messageId: string, body: string, targetLanguage: string) => void) | undefined;
    translatingMessageId?: string | null | undefined;
    translatedTexts?: Record<string, string> | undefined;
    onClearTranslation?: ((messageId: string) => void) | undefined;
    className?: string | undefined;
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
    onTranslate,
    translatingMessageId,
    translatedTexts,
    onClearTranslation,
    className,
}: MessageBubbleProps) {
    const ms = useMessagingStrings();
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
                        <span className="text-xs text-muted-foreground italic">
                            ({ms("message_edited")})
                        </span>
                    )}
                    {message.is_pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    {message.priority !== "normal" && (
                        <span
                            className={cn(
                                "density-caption font-semibold uppercase px-1.5 py-0.5 rounded",
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
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleEditSave}
                                className="text-xs p-0 h-auto"
                            >
                                Save
                            </Button>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                className="text-xs p-0 h-auto text-muted-foreground"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words mt-0.5">
                        {message.deleted_at ? (
                            <span className="italic text-muted-foreground">
                                {ms("message_deleted")}
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
                            <Button
                                key={reaction.emoji}
                                variant="outline"
                                size="sm"
                                onClick={() => onReact?.(message.id, reaction.emoji)}
                                className={cn(
                                    "rounded-full h-auto px-2 py-0.5 text-xs gap-1",
                                    reaction.has_reacted &&
                                        "border-primary/30 bg-primary/10 text-primary"
                                )}
                                aria-label={`${reaction.emoji} ${reaction.count} reactions`}
                            >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                            </Button>
                        ))}
                    </div>
                )}

                {/* Voice attachment player */}
                {message.attachments?.some(
                    (a) => a.file_type === "audio/webm" || a.file_type?.startsWith("audio/")
                ) &&
                    (() => {
                        const voiceAttachment = message.attachments.find(
                            (a) => a.file_type === "audio/webm" || a.file_type?.startsWith("audio/")
                        );
                        return voiceAttachment ? (
                            <VoiceMessagePlayer
                                src={voiceAttachment.url}
                                durationSeconds={0}
                                className="mt-1.5 max-w-[240px]"
                            />
                        ) : null;
                    })()}

                {/* Translation */}
                {translatedTexts?.[message.id] ? (
                    <div className="mt-1.5 space-y-1">
                        <p className="text-xs text-foreground/80 italic bg-secondary/30 rounded px-2 py-1">
                            {translatedTexts[message.id]}
                        </p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => onClearTranslation?.(message.id)}
                            className="density-caption p-0 h-auto"
                        >
                            {ms("translate_show_original")}
                        </Button>
                    </div>
                ) : onTranslate && !message.deleted_at ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTranslate(message.id, message.body, "es")}
                        disabled={translatingMessageId === message.id}
                        className="inline-flex items-center gap-1 mt-1 density-caption p-0 h-auto text-muted-foreground hover:text-foreground"
                        aria-label={ms("translate_button")}
                    >
                        <Globe className="h-3 w-3" />
                        {translatingMessageId === message.id
                            ? ms("translate_translating")
                            : ms("translate_button")}
                    </Button>
                ) : null}

                {/* Thread indicator */}
                {message.thread_message_count > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => onThreadOpen?.(message.id)}
                        className="flex items-center gap-1.5 mt-1.5 text-xs p-0 h-auto"
                    >
                        <MessageSquare className="h-3 w-3" />
                        <span>
                            {message.thread_message_count}{" "}
                            {message.thread_message_count === 1 ? "reply" : "replies"}
                        </span>
                    </Button>
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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onReact?.(message.id, emoji)}
                                className="h-6 w-6 text-sm"
                                aria-label={`React with ${emoji}`}
                            >
                                {emoji}
                            </Button>
                        </Tooltip>
                    ))}
                    <Tooltip content={ms("message_thread")} side="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onReply?.(message)}
                            className="h-6 w-6"
                            aria-label={ms("message_thread")}
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                    </Tooltip>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Tooltip content="More actions" side="top">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    aria-label="More actions"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </Tooltip>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {onPin && (
                                <DropdownMenuItem
                                    onClick={() => onPin(message.id, !message.is_pinned)}
                                >
                                    <Pin className="h-3.5 w-3.5 mr-2" />
                                    {message.is_pinned ? ms("message_unpin") : ms("message_pin")}
                                </DropdownMenuItem>
                            )}
                            {isOwn && onEdit && (
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    {ms("message_edit")}
                                </DropdownMenuItem>
                            )}
                            {isOwn && onDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(message.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    {ms("message_delete")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
