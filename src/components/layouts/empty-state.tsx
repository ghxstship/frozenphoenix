"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Inbox, LucideIcon } from "lucide-react";

export interface EmptyStateProps {
    icon?: LucideIcon | undefined;
    title: string;
    description?: string | undefined;
    action?:
        | {
              label: string;
              onClick: () => void;
          }
        | undefined;
    secondaryAction?:
        | {
              label: string;
              onClick: () => void;
          }
        | undefined;
    compact?: boolean | undefined;
    className?: string | undefined;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    secondaryAction,
    compact = false,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center motion-safe:animate-fade-in",
                compact ? "py-8 px-4" : "py-16 px-4",
                className
            )}
            role="status"
        >
            <div
                className={cn(
                    "rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 ring-1 ring-border/50",
                    compact ? "h-12 w-12" : "h-16 w-16"
                )}
            >
                <Icon className={cn("text-muted-foreground/60", compact ? "h-6 w-6" : "h-8 w-8")} />
            </div>
            <h3 className={cn("font-semibold mb-1", compact ? "text-base" : "text-lg")}>{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
                    {description}
                </p>
            )}
            {(action || secondaryAction) && (
                <div className="flex items-center gap-3">
                    {secondaryAction && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={secondaryAction.onClick}
                            aria-label={secondaryAction.label}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                    {action && (
                        <Button
                            size={compact ? "sm" : "default"}
                            onClick={action.onClick}
                            aria-label={action.label}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
