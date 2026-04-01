"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CopilotSuggestionsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    className?: string | undefined;
}

export function CopilotSuggestions({ suggestions, onSelect, className }: CopilotSuggestionsProps) {
    if (suggestions.length === 0) return null;

    return (
        <div
            className={cn("px-4 py-3 space-y-2", className)}
            role="group"
            aria-label="Suggested prompts"
        >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                    <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(suggestion)}
                        className="text-left h-auto py-1.5"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    );
}

/**
 * Default suggestions shown when a conversation is empty,
 * contextualised by the user's current page.
 */
export function getDefaultSuggestions(
    pageContext?: { entityType: string; entityName?: string } | null
): string[] {
    if (pageContext?.entityType === "project") {
        return [
            "What's the current status of this project?",
            "Show me the budget breakdown",
            "Who's assigned to tasks this week?",
            "Generate a status report",
        ];
    }

    if (pageContext?.entityType === "event") {
        return [
            "What's the timeline for this event?",
            "Show crew assignments",
            "Any outstanding tasks?",
            "Generate a run of show summary",
        ];
    }

    if (pageContext?.entityType === "task") {
        return [
            "What's blocking this task?",
            "Show related project details",
            "Who else is working on this project?",
        ];
    }

    return [
        "What projects are active right now?",
        "Show me my tasks for this week",
        "What invoices are overdue?",
        "Generate a weekly status summary",
    ];
}
