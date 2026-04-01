"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, Square } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface CopilotInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (message: string) => void;
    onStop?: (() => void) | undefined;
    isStreaming?: boolean | undefined;
    disabled?: boolean | undefined;
    placeholder?: string | undefined;
    className?: string | undefined;
}

export function CopilotInput({
    value,
    onChange,
    onSubmit,
    onStop,
    isStreaming = false,
    disabled = false,
    placeholder = "Ask the copilot anything…",
    className,
}: CopilotInputProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [value]);

    // Focus on mount
    React.useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = React.useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSubmit(trimmed);
    }, [value, disabled, onSubmit]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isStreaming) return;
                handleSubmit();
            }
        },
        [isStreaming, handleSubmit]
    );

    return (
        <div className={cn("relative border-t border-border bg-background px-4 py-3", className)}>
            <div className="relative flex items-end gap-2">
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            "w-full resize-none rounded-xl border border-border bg-secondary/30",
                            "px-4 py-2.5 pr-10 text-sm leading-relaxed",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "max-h-[200px] overflow-y-auto"
                        )}
                        aria-label="Copilot message input"
                    />
                </div>

                {/* Send / Stop button */}
                {isStreaming ? (
                    <Tooltip content="Stop generating" side="top">
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={onStop}
                            className="h-9 w-9 shrink-0 rounded-xl"
                            aria-label="Stop generating"
                        >
                            <Square className="h-3.5 w-3.5" />
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip content="Send message (Enter)" side="top">
                        <Button
                            size="icon"
                            onClick={handleSubmit}
                            disabled={!value.trim() || disabled}
                            className={cn(
                                "h-9 w-9 shrink-0 rounded-xl",
                                !value.trim() && "bg-secondary text-muted-foreground"
                            )}
                            aria-label="Send message"
                        >
                            {disabled && !isStreaming ? (
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
                        </Button>
                    </Tooltip>
                )}
            </div>

            <p className="density-caption text-muted-foreground mt-1.5 text-center">
                AI responses may be inaccurate. Verify important information.
            </p>
        </div>
    );
}
