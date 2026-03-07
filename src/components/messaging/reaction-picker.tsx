"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QUICK_REACTIONS } from "@/types/messaging";

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    className?: string;
}

export function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg",
                className
            )}
            role="grid"
            aria-label="Quick reactions"
        >
            {QUICK_REACTIONS.map((emoji) => (
                <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-base hover:bg-secondary"
                    onClick={() => onSelect(emoji)}
                    aria-label={`React with ${emoji}`}
                >
                    {emoji}
                </Button>
            ))}
        </div>
    );
}
