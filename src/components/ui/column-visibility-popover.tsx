"use client";

/* ═══════════════════════════════════════════════════════════════
   COLUMN VISIBILITY POPOVER — Interactive column show/hide toggle

   Renders a Popover with a checkbox list of all available columns.
   Users can toggle individual columns or reset to defaults.
   Visibility state is managed by the parent (ListPageShell).
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { Columns3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ColumnVisibilityItem {
    id: string;
    header: string;
    visible: boolean;
    sticky?: boolean;
}

export interface ColumnVisibilityPopoverProps {
    columns: ColumnVisibilityItem[];
    onToggle: (columnId: string) => void;
    onReset: () => void;
    onShowAll: () => void;
    onHideAll: () => void;
}

export function ColumnVisibilityPopover({
    columns,
    onToggle,
    onReset,
    onShowAll,
    onHideAll,
}: ColumnVisibilityPopoverProps) {
    const visibleCount = columns.filter((c) => c.visible).length;
    const hasChanges =
        columns.some((c) => c.visible === (c.sticky ? true : false)) ||
        visibleCount !== columns.length;

    return (
        <Popover>
            <Tooltip content="Column visibility" side="bottom">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        aria-label="Toggle column visibility"
                    >
                        <Columns3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Columns</span>
                        {visibleCount < columns.length && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {visibleCount}/{columns.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
            </Tooltip>
            <PopoverContent align="end" className="w-56 p-0">
                <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            {visibleCount} of {columns.length} visible
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={onShowAll}
                                disabled={visibleCount === columns.length}
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={onHideAll}
                                disabled={visibleCount === 0}
                            >
                                None
                            </Button>
                            {hasChanges && (
                                <Tooltip content="Reset to defaults" side="left">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={onReset}
                                        aria-label="Reset column visibility to defaults"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className="max-h-64 overflow-y-auto p-1"
                    role="group"
                    aria-label="Column visibility toggles"
                >
                    {columns.map((col) => (
                        <label
                            key={col.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                        >
                            <input
                                type="checkbox"
                                checked={col.visible}
                                onChange={() => onToggle(col.id)}
                                disabled={col.sticky}
                                className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring disabled:opacity-50"
                                aria-label={`${col.visible ? "Hide" : "Show"} ${col.header} column`}
                            />
                            <span
                                className={
                                    col.visible ? "text-foreground" : "text-muted-foreground"
                                }
                            >
                                {col.header}
                            </span>
                            {col.sticky && (
                                <span className="density-caption text-muted-foreground ml-auto">
                                    pinned
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

ColumnVisibilityPopover.displayName = "ColumnVisibilityPopover";
