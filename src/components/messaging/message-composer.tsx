"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AtSign, Paperclip, Send, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { MessagePriority } from "@/types/messaging";

interface MessageComposerProps {
    onSend: (payload: {
        body: string;
        mentioned_user_ids?: string[];
        priority?: MessagePriority;
    }) => void;
    placeholder?: string;
    disabled?: boolean;
    replyTo?: { messageId: string; body: string; senderName: string } | null;
    onCancelReply?: () => void;
    draft?: string;
    onDraftChange?: (text: string) => void;
    className?: string;
}

export function MessageComposer({
    onSend,
    placeholder = "Type a message...",
    disabled = false,
    replyTo,
    onCancelReply,
    draft = "",
    onDraftChange,
    className,
}: MessageComposerProps) {
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
                    <Tooltip content="Cancel reply" side="top">
                        <button
                            onClick={onCancelReply}
                            className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Cancel reply"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </Tooltip>
                </div>
            )}
            <div className="flex items-end gap-2 p-3">
                <div className="flex gap-1">
                    <Tooltip content="Attach file" side="top">
                        <button
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Attach file"
                            tabIndex={-1}
                        >
                            <Paperclip className="h-4 w-4" />
                        </button>
                    </Tooltip>
                    <Tooltip content="Mention someone" side="top">
                        <button
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Mention someone"
                            tabIndex={-1}
                        >
                            <AtSign className="h-4 w-4" />
                        </button>
                    </Tooltip>
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
                <Tooltip content="Send message" side="top">
                    <button
                        onClick={handleSend}
                        disabled={disabled || !text.trim()}
                        className={cn(
                            "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors",
                            text.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                        )}
                        aria-label="Send message"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
}
