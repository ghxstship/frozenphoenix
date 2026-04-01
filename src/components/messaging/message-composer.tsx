"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AtSign, Paperclip, Send, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { MessagePriority } from "@/types/messaging";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface MessageComposerProps {
    onSend: (payload: {
        body: string;
        mentioned_user_ids?: string[] | undefined;
        priority?: MessagePriority | undefined;
    }) => void;
    placeholder?: string | undefined;
    disabled?: boolean | undefined;
    replyTo?: { messageId: string; body: string; senderName: string } | null | undefined;
    onCancelReply?: (() => void) | undefined;
    draft?: string | undefined;
    onDraftChange?: ((text: string) => void) | undefined;
    extraActions?: React.ReactNode | undefined;
    className?: string | undefined;
}

export function MessageComposer({
    onSend,
    placeholder = "Type a message...",
    disabled = false,
    replyTo,
    onCancelReply,
    draft = "",
    onDraftChange,
    extraActions,
    className,
}: MessageComposerProps) {
    const ms = useMessagingStrings();
    const [text, setText] = React.useState(draft);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        setText(draft);
    }, [draft]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setText(value);
        onDraftChange?.(value);
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;

        // Parse @mentions (simple pattern: @[name](uuid))
        const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g;
        const mentionedIds: string[] = [];
        let match;
        while ((match = mentionRegex.exec(trimmed)) !== null) {
            if (match[2]) mentionedIds.push(match[2]);
        }

        onSend({
            body: trimmed,
            mentioned_user_ids: mentionedIds.length > 0 ? mentionedIds : undefined,
        });

        setText("");
        onDraftChange?.("");
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }, [text]);

    return (
        <div className={cn("border-t border-border bg-background", className)}>
            {replyTo && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex-1 min-w-0 rounded-md bg-secondary/50 px-3 py-1.5 text-xs">
                        <span className="font-medium text-foreground">{replyTo.senderName}</span>
                        <p className="truncate text-muted-foreground">{replyTo.body}</p>
                    </div>
                    <Tooltip content={ms("composer_cancel_reply")} side="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCancelReply}
                            className="shrink-0 h-6 w-6"
                            aria-label={ms("composer_cancel_reply")}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </Tooltip>
                </div>
            )}
            <div className="flex items-end gap-2 p-3">
                <div className="flex gap-1">
                    <Tooltip content="Attach file" side="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Attach file"
                            tabIndex={-1}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Mention someone" side="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Mention someone"
                            tabIndex={-1}
                        >
                            <AtSign className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    {extraActions}
                </div>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "flex-1 resize-none rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "min-h-[36px] max-h-[160px]"
                    )}
                    aria-label="Message input"
                />
                <Tooltip content={ms("composer_send")} side="top">
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={disabled || !text.trim()}
                        className={cn(
                            "h-9 w-9 shrink-0 rounded-lg",
                            !text.trim() && "bg-secondary text-muted-foreground"
                        )}
                        aria-label={ms("composer_send")}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
}
