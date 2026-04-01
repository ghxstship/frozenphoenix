"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown } from "lucide-react";

interface ModelBadgeProps {
    modelName: string;
    providerName?: string | undefined;
    onClick?: (() => void) | undefined;
    className?: string | undefined;
}

export function ModelBadge({ modelName, providerName, onClick, className }: ModelBadgeProps) {
    const isClickable = !!onClick;

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={!isClickable}
            className={cn(
                "inline-flex items-center gap-1.5 density-caption h-auto py-1",
                !isClickable && "cursor-default opacity-100",
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
        </Button>
    );
}
