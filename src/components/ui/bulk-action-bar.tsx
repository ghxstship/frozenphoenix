"use client";

/* ═══════════════════════════════════════════════════════════════
   BULK ACTION BAR — Floating toolbar for bulk operations
   
   Appears when rows are selected in a DataTable. Shows selection
   count and action buttons. Animates in/out.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ListBulkActionDef } from "@/types/list-page-config";

interface BulkActionBarProps {
    selectedCount: number;
    actions: ListBulkActionDef[];
    selectedIds: string[];
    onClearSelection: () => void;
    className?: string;
}

export function BulkActionBar({
    selectedCount,
    actions,
    selectedIds,
    onClearSelection,
    className,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
                "flex items-center gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-2.5 shadow-lg",
                "animate-slide-up",
                className
            )}
            role="toolbar"
            aria-label="Bulk actions"
        >
            <span className="text-sm font-medium tabular-nums">{selectedCount} selected</span>

            <div className="h-4 w-px bg-border" aria-hidden="true" />

            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <Button
                        key={action.id}
                        size="sm"
                        variant={action.variant === "destructive" ? "destructive" : "secondary"}
                        onClick={() => action.onExecute(selectedIds)}
                        className="gap-1.5"
                    >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {action.label}
                    </Button>
                );
            })}

            <div className="h-4 w-px bg-border" aria-hidden="true" />

            <button
                type="button"
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear selection"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

BulkActionBar.displayName = "BulkActionBar";
