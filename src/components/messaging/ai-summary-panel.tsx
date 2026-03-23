"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, CheckSquare, Lightbulb, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";
import type { AISummaryResult } from "@/lib/supabase/hooks-messaging";

interface AISummaryPanelProps {
    conversationId: string | undefined;
    onGenerate: () => void;
    isGenerating: boolean;
    result: AISummaryResult | null | undefined;
    error?: string | null | undefined;
    onDismiss: () => void;
    className?: string | undefined;
}

export function AISummaryPanel({
    conversationId,
    onGenerate,
    isGenerating,
    result,
    error,
    onDismiss,
    className,
}: AISummaryPanelProps) {
    const ms = useMessagingStrings();

    if (!conversationId) return null;

    if (!result && !isGenerating && !error) {
        return (
            <div className={cn("px-4 py-2 border-b border-border", className)}>
                <Button variant="ghost" size="sm" onClick={onGenerate} className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {ms("ai_summary_generate")}
                </Button>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 px-4 py-3 border-b border-border bg-primary/5",
                    className
                )}
            >
                <Loader2 className="h-4 w-4 motion-safe:animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{ms("ai_summary_generating")}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-2 border-b border-border bg-destructive/5",
                    className
                )}
            >
                <span className="text-xs text-destructive">{ms("ai_summary_error")}</span>
                <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    if (!result) return null;

    return (
        <Card
            className={cn("mx-4 my-3 border-primary/20 bg-primary/5", className)}
            role="region"
            aria-label={ms("a11y_ai_summary")}
        >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    {ms("ai_summary_title")}
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Badge variant="ghost" className="density-caption">
                        {result.message_count} messages
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="h-6 w-6 p-0"
                        aria-label={ms("ai_summary_dismiss")}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                <p className="text-xs text-foreground/90 leading-relaxed">{result.summary}</p>

                {result.action_items.length > 0 && (
                    <div>
                        <h4 className="density-caption font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            {ms("ai_summary_action_items")}
                        </h4>
                        <ul className="space-y-1">
                            {result.action_items.map((item, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-foreground/80 flex items-start gap-1.5"
                                >
                                    <span className="text-primary mt-0.5">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.key_decisions.length > 0 && (
                    <div>
                        <h4 className="density-caption font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            {ms("ai_summary_key_decisions")}
                        </h4>
                        <ul className="space-y-1">
                            {result.key_decisions.map((item, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-foreground/80 flex items-start gap-1.5"
                                >
                                    <span className="text-primary mt-0.5">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
