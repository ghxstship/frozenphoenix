"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown } from "lucide-react";

interface ModelBadgeProps {
    modelName: string;
    providerName?: string;
    onClick?: () => void;
    className?: string;
}

export function ModelBadge({ modelName, providerName, onClick, className }: ModelBadgeProps) {
    const isClickable = !!onClick;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isClickable}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border",
                "px-2 py-1 density-caption text-muted-foreground",
                isClickable && "hover:bg-secondary hover:text-foreground cursor-pointer",
                !isClickable && "cursor-default",
                "transition-colors",
                className
            )}
            aria-label={`Current model: ${modelName}`}
        >
            <Bot className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[120px]">{modelName}</span>
            {providerName && (
                <span className="text-muted-foreground/60 truncate max-w-[60px]">
                    ({providerName})
                </span>
            )}
            {isClickable && <ChevronDown className="h-3 w-3 shrink-0" />}
        </button>
    );
}
