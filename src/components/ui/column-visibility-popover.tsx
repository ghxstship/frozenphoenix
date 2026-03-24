"use client";

/* ═══════════════════════════════════════════════════════════════
   COLUMN VISIBILITY POPOVER — Interactive column show/hide + drag reorder

   Renders a Popover with a sortable list of all available fields.
   Users can toggle visibility, drag-to-reorder, or reset to defaults.
   Uses @dnd-kit/sortable for drag-and-drop reordering.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { Columns3, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ColumnVisibilityItem {
    id: string;
    header: string;
    visible: boolean;
    sticky?: boolean | undefined;
}

export interface ColumnVisibilityPopoverProps {
    columns: ColumnVisibilityItem[];
    onToggle: (columnId: string) => void;
    onReset: () => void;
    onShowAll: () => void;
    onHideAll: () => void;
    onReorder?: ((activeId: string, overId: string) => void) | undefined;
    /** Button label — defaults to "Columns" */
    label?: string | undefined;
}

// ─── Sortable Row ────────────────────────────────────────────

function SortableFieldRow({
    col,
    onToggle,
    reorderable,
}: {
    col: ColumnVisibilityItem;
    onToggle: (id: string) => void;
    reorderable: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: col.id,
        disabled: !reorderable || !!col.sticky,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-sm"
        >
            {reorderable && (
                <button
                    type="button"
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
                    aria-label={`Reorder ${col.header}`}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>
            )}
            <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => onToggle(col.id)}
                    disabled={col.sticky}
                    className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring disabled:opacity-50 flex-shrink-0"
                    aria-label={`${col.visible ? "Hide" : "Show"} ${col.header}`}
                />
                <span
                    className={
                        col.visible ? "text-foreground truncate" : "text-muted-foreground truncate"
                    }
                >
                    {col.header}
                </span>
            </label>
            {col.sticky && (
                <span className="density-caption text-muted-foreground ml-auto flex-shrink-0">
                    pinned
                </span>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────

export function ColumnVisibilityPopover({
    columns,
    onToggle,
    onReset,
    onShowAll,
    onHideAll,
    onReorder,
    label = "Columns",
}: ColumnVisibilityPopoverProps) {
    const visibleCount = columns.filter((c) => c.visible).length;
    const hasChanges =
        columns.some((c) => c.visible === (c.sticky ? true : false)) ||
        visibleCount !== columns.length;

    const reorderable = Boolean(onReorder);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id || !onReorder) return;
            onReorder(String(active.id), String(over.id));
        },
        [onReorder]
    );

    const columnIds = React.useMemo(() => columns.map((c) => c.id), [columns]);

    const listContent = (
        <div
            className="max-h-64 overflow-y-auto p-1"
            role="group"
            aria-label="Field visibility toggles"
        >
            {columns.map((col) => (
                <SortableFieldRow
                    key={col.id}
                    col={col}
                    onToggle={onToggle}
                    reorderable={reorderable}
                />
            ))}
        </div>
    );

    return (
        <Popover>
            <Tooltip content={`${label} visibility`} side="bottom">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        aria-label={`Toggle ${label.toLowerCase()} visibility`}
                    >
                        <Columns3 className="h-4 w-4" />
                        <span className="hidden sm:inline">{label}</span>
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
                                        aria-label="Reset field visibility to defaults"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
                {reorderable ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
                            {listContent}
                        </SortableContext>
                    </DndContext>
                ) : (
                    listContent
                )}
            </PopoverContent>
        </Popover>
    );
}

ColumnVisibilityPopover.displayName = "ColumnVisibilityPopover";
