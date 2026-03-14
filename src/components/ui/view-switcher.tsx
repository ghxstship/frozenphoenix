"use client";

/* ═══════════════════════════════════════════════════════════════
   VIEW SWITCHER — Toggle between table/board/cards display modes
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Kanban, LayoutGrid, LayoutList } from "lucide-react";

export type ViewMode = "table" | "board" | "cards";

const VIEW_META: Record<ViewMode, { icon: React.ElementType; label: string }> = {
    table: { icon: LayoutList, label: "Table view" },
    board: { icon: Kanban, label: "Board view" },
    cards: { icon: LayoutGrid, label: "Card view" },
};

interface ViewSwitcherProps {
    views: ViewMode[];
    value: ViewMode;
    onValueChange: (view: ViewMode) => void;
    className?: string;
}

export function ViewSwitcher({ views, value, onValueChange, className }: ViewSwitcherProps) {
    if (views.length <= 1) return null;

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-lg border border-input bg-background p-0.5",
                className
            )}
            role="radiogroup"
            aria-label="Display mode"
        >
            {views.map((view) => {
                const { icon: Icon, label } = VIEW_META[view];
                const isActive = value === view;

                return (
                    <button
                        key={view}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={label}
                        onClick={() => onValueChange(view)}
                        className={cn(
                            "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                                ? "bg-secondary text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );
}

ViewSwitcher.displayName = "ViewSwitcher";
