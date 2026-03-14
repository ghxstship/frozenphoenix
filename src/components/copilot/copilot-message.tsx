"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, Check, Copy, User } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { CopilotMessage as CopilotMessageType } from "@/hooks/use-copilot";
import { CopilotToolActivity } from "./copilot-tool-activity";

interface CopilotMessageProps {
    message: CopilotMessageType;
    className?: string;
}

export function CopilotMessage({ message, className }: CopilotMessageProps) {
    const [copied, setCopied] = React.useState(false);

    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";

    const handleCopy = React.useCallback(async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [message.content]);

    return (
        <div
            className={cn("group flex gap-3 px-4 py-3", isUser && "flex-row-reverse", className)}
            role="article"
            aria-label={`${message.role} message`}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                )}
            >
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            {/* Content */}
            <div className={cn("flex flex-col gap-1 max-w-[85%] min-w-0", isUser && "items-end")}>
                {/* Tool calls (before or during content) */}
                {isAssistant && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="space-y-1 w-full">
                        {message.toolCalls.map((tc) => (
                            <CopilotToolActivity key={tc.id} name={tc.name} status={tc.status} />
                        ))}
                    </div>
                )}

                {/* Message bubble */}
                {message.content && (
                    <div
                        className={cn(
                            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                            isUser
                                ? "bg-primary text-primary-foreground rounded-tr-md"
                                : "bg-secondary/60 text-foreground rounded-tl-md"
                        )}
                    >
                        {/* Streaming cursor */}
                        {message.isStreaming ? (
                            <span>
                                {message.content}
                                <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm" />
                            </span>
                        ) : (
                            <MessageContent content={message.content} />
                        )}
                    </div>
                )}

                {/* Actions (assistant only, not streaming) */}
                {isAssistant && !message.isStreaming && message.content && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip content={copied ? "Copied!" : "Copy"} side="bottom">
                            <button
                                onClick={handleCopy}
                                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                aria-label="Copy message"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Markdown-lite renderer ──────────────────────────────────

function MessageContent({ content }: { content: string }) {
    // Simple markdown: bold, italic, inline code, code blocks, lists
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, i) => {
        if (line.startsWith("```")) {
            if (inCodeBlock) {
                elements.push(
                    <pre
                        key={`code-${i}`}
                        className="bg-background/50 rounded-md p-2 text-xs font-mono overflow-x-auto my-1"
                    >
                        <code>{codeBlockContent.join("\n")}</code>
                    </pre>
                );
                codeBlockContent = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            return;
        }

        if (line.trim() === "") {
            elements.push(<br key={`br-${i}`} />);
            return;
        }

        // Headings
        if (line.startsWith("### ")) {
            elements.push(
                <strong key={`h3-${i}`} className="block text-sm font-semibold mt-2">
                    {line.slice(4)}
                </strong>
            );
            return;
        }
        if (line.startsWith("## ")) {
            elements.push(
                <strong key={`h2-${i}`} className="block text-sm font-bold mt-2">
                    {line.slice(3)}
                </strong>
            );
            return;
        }

        // List items
        if (line.match(/^[-*]\s/)) {
            elements.push(
                <div key={`li-${i}`} className="flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{formatInline(line.slice(2))}</span>
                </div>
            );
            return;
        }

        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s/);
        if (numMatch) {
            elements.push(
                <div key={`ol-${i}`} className="flex gap-2">
                    <span className="text-muted-foreground">{numMatch[1]}.</span>
                    <span>{formatInline(line.slice(numMatch[0].length))}</span>
                </div>
            );
            return;
        }

        elements.push(<p key={`p-${i}`}>{formatInline(line)}</p>);
    });

    return <>{elements}</>;
}

function formatInline(text: string): React.ReactNode {
    // Inline code
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={i} className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">
                    {part.slice(1, -1)}
                </code>
            );
        }
        // Bold
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
                return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
            }
            return bp;
        });
    });
}
