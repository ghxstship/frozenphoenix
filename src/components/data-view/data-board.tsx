"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA BOARD — ClickUp-Style Kanban Board View
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "@/lib/motion";
import { useMotion } from "@/hooks/use-motion";
import { useBreakpoint } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { TruncatedText } from "@/components/ui/truncated-text";
import { type FieldConfig, FieldRenderer, type FieldType } from "./field-renderers";
import type { BadgeVariant } from "@/config/ui-variants";

// ─── Column Definition ───
export interface BoardColumn<T> {
    id: string;
    title: string;
    variant?: BadgeVariant | undefined;
    filter: (item: T) => boolean;
    count?: number | undefined;
}

// ─── Card Field Definition ───
export interface CardField<T> {
    id: string;
    label?: string | undefined;
    accessorKey?: keyof T | undefined;
    accessorFn?: ((row: T) => unknown) | undefined;
    fieldType?: FieldType | undefined;
    fieldConfig?: Partial<FieldConfig> | undefined;
    render?: ((value: unknown, row: T) => React.ReactNode) | undefined;
    position?: "header" | "body" | "footer" | undefined;
}

// ─── Board Props ───
export interface DataBoardProps<T> {
    data: T[];
    columns: BoardColumn<T>[];
    keyField: keyof T;
    cardFields: CardField<T>[];
    // Card rendering
    cardTitle: keyof T | ((row: T) => string);
    cardSubtitle?: keyof T | ((row: T) => string) | undefined;
    // Interactions
    actions?: ((row: T) => React.ReactNode) | undefined;
    onCardClick?: ((item: T) => void) | undefined;
    onDragEnd?: ((itemId: string, fromColumn: string, toColumn: string) => void) | undefined;
    // Styling
    columnWidth?: number | undefined;
    cardClassName?: string | undefined;
    className?: string | undefined;
    // Empty state
    emptyColumnState?: React.ReactNode | undefined;
    /** Rendered when the entire data array is empty (no items across any column) */
    emptyState?: React.ReactNode | undefined;
}

// ─── Droppable Column Wrapper ───
function DroppableColumn({
    id,
    children,
    className,
    style,
    role,
    ariaLabel,
}: {
    id: string;
    children: React.ReactNode;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
    role?: string | undefined;
    ariaLabel?: string | undefined;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={cn(className, isOver && "ring-2 ring-primary/30 bg-primary/5")}
            style={style}
            role={role}
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
}

// ─── Draggable Card Wrapper ───
function DraggableCard({
    id,
    disabled,
    children,
}: {
    id: string;
    disabled?: boolean | undefined;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        disabled: disabled ?? false,
    });
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn("touch-none", isDragging && "opacity-30")}
        >
            {children}
        </div>
    );
}

export function DataBoard<T extends object>({
    data,
    columns,
    keyField,
    cardFields,
    cardTitle,
    cardSubtitle,
    actions,
    onCardClick,
    onDragEnd,
    columnWidth = 300,
    cardClassName,
    className,
    emptyColumnState,
    emptyState,
}: DataBoardProps<T>) {
    const { shouldAnimate, getSpring } = useMotion();
    const { isMobile } = useBreakpoint();
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [mobileColumnIdx, setMobileColumnIdx] = React.useState(0);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // ─── Group Data by Column ───
    const groupedData = React.useMemo(() => {
        const groups: Record<string, T[]> = {};
        columns.forEach((col) => {
            groups[col.id] = data.filter(col.filter);
        });
        return groups;
    }, [data, columns]);

    // ─── Lookup helpers ───
    const dataMap = React.useMemo(() => {
        const map = new Map<string, T>();
        data.forEach((item) => map.set(String(item[keyField]), item));
        return map;
    }, [data, keyField]);

    const findColumnForItem = React.useCallback(
        (itemId: string): string | undefined => {
            for (const [colId, items] of Object.entries(groupedData)) {
                if (items.some((item) => String(item[keyField]) === itemId)) {
                    return colId;
                }
            }
            return undefined;
        },
        [groupedData, keyField]
    );

    // ─── DnD handlers ───
    const handleDragStart = React.useCallback((event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    }, []);

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            setActiveId(null);
            const { active, over } = event;
            if (!over || !onDragEnd) return;

            const itemId = String(active.id);
            const fromColumn = findColumnForItem(itemId);
            const toColumn = String(over.id);

            if (fromColumn && toColumn && fromColumn !== toColumn) {
                onDragEnd(itemId, fromColumn, toColumn);
            }
        },
        [onDragEnd, findColumnForItem]
    );

    const handleDragCancel = React.useCallback(() => {
        setActiveId(null);
    }, []);

    // ─── Get Field Value ───
    const getFieldValue = (row: T, field: CardField<T>): unknown => {
        if (field.accessorFn) return field.accessorFn(row);
        if (field.accessorKey) return row[field.accessorKey];
        return undefined;
    };

    // ─── Get Title ───
    const getTitle = (row: T): string => {
        if (typeof cardTitle === "function") return cardTitle(row);
        return String(row[cardTitle] ?? "");
    };

    // ─── Get Subtitle ───
    const getSubtitle = (row: T): string | undefined => {
        if (!cardSubtitle) return undefined;
        if (typeof cardSubtitle === "function") return cardSubtitle(row);
        const value = row[cardSubtitle];
        return value != null ? String(value) : undefined;
    };

    // ─── Render Card Field ───
    const renderCardField = (row: T, field: CardField<T>) => {
        const value = getFieldValue(row, field);

        if (field.render) {
            return field.render(value, row);
        }

        if (field.fieldType) {
            return (
                <FieldRenderer
                    value={value}
                    config={{ type: field.fieldType, ...field.fieldConfig }}
                />
            );
        }

        if (value == null) return null;
        return <span className="text-sm">{String(value)}</span>;
    };

    // ─── Render Card Content (shared between inline + overlay) ───
    const renderCardContent = (item: T) => {
        const title = getTitle(item);
        const subtitle = getSubtitle(item);

        const headerFields = cardFields.filter((f) => f.position === "header");
        const bodyFields = cardFields.filter((f) => !f.position || f.position === "body");
        const footerFields = cardFields.filter((f) => f.position === "footer");

        return (
            <div
                onClick={() => onCardClick?.(item)}
                onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onCardClick) {
                        e.preventDefault();
                        onCardClick(item);
                    }
                }}
                role={onCardClick ? "button" : undefined}
                tabIndex={onCardClick ? 0 : undefined}
                aria-label={title}
                className={cn(
                    "bg-card rounded-lg border border-border p-3 shadow-sm",
                    "hover:shadow-md hover:border-border/80 transition-all duration-200",
                    onCardClick &&
                        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    onDragEnd && "cursor-grab active:cursor-grabbing",
                    cardClassName
                )}
            >
                {/* Header */}
                {headerFields.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        {headerFields.map((field) => (
                            <div key={field.id}>{renderCardField(item, field)}</div>
                        ))}
                    </div>
                )}

                {/* Title */}
                <TruncatedText
                    as="h4"
                    className="font-medium text-sm leading-tight mb-1"
                    maxLines={2}
                >
                    {title}
                </TruncatedText>

                {/* Subtitle */}
                {subtitle && (
                    <TruncatedText as="p" className="text-xs text-muted-foreground mb-2">
                        {subtitle}
                    </TruncatedText>
                )}

                {/* Body Fields */}
                {bodyFields.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                        {bodyFields.map((field) => {
                            const value = getFieldValue(item, field);
                            if (value == null) return null;
                            return (
                                <div
                                    key={field.id}
                                    className="flex items-center justify-between gap-2"
                                >
                                    {field.label && (
                                        <span className="text-xs text-muted-foreground">
                                            {field.label}
                                        </span>
                                    )}
                                    <div className="flex-1 text-right">
                                        {renderCardField(item, field)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                {footerFields.length > 0 && (
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
                        {footerFields.map((field) => (
                            <div key={field.id}>{renderCardField(item, field)}</div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                {actions && (
                    <div
                        className="flex items-center justify-end mt-2 pt-2 border-t border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {actions(item)}
                    </div>
                )}
            </div>
        );
    };

    // ─── Render Card (with optional DnD + layout animation) ───
    const renderCard = (item: T) => {
        const key = String(item[keyField]);
        const isDragEnabled = Boolean(onDragEnd);
        const spring = getSpring("snappy");
        const MotionWrapper = shouldAnimate ? motion.div : "div";
        const motionProps = shouldAnimate
            ? { layout: true, transition: { type: "spring" as const, ...spring } }
            : {};

        const card = (
            <MotionWrapper key={key} {...motionProps}>
                {renderCardContent(item)}
            </MotionWrapper>
        );

        if (isDragEnabled) {
            return (
                <DraggableCard key={key} id={key}>
                    {card}
                </DraggableCard>
            );
        }

        return card;
    };

    // ─── Drag Overlay ───
    const activeItem = activeId ? dataMap.get(activeId) : null;

    if (data.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    const mobileColumn = columns[mobileColumnIdx];
    const mobileItems = mobileColumn ? (groupedData[mobileColumn.id] ?? []) : [];

    const mobileContent = (
        <div className={cn("space-y-3", className)}>
            {/* Column tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {columns.map((col, idx) => {
                    const count = (groupedData[col.id] ?? []).length;
                    return (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => setMobileColumnIdx(idx)}
                            className={cn(
                                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                idx === mobileColumnIdx
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {col.title}
                            <span className="ml-1 opacity-70">{count}</span>
                        </button>
                    );
                })}
            </div>
            {/* Cards for active column */}
            <div className="space-y-2">
                {mobileItems.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        {emptyColumnState ?? "No items"}
                    </div>
                ) : (
                    mobileItems.map(renderCard)
                )}
            </div>
        </div>
    );

    const boardContent = (
        <div
            className={cn(
                "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth",
                "scrollbar-thin",
                isMobile && "hidden",
                className
            )}
            role="region"
            aria-label="Kanban board"
        >
            {columns.map((column) => {
                const items = groupedData[column.id] ?? [];
                const count = column.count ?? items.length;

                return (
                    <div
                        key={column.id}
                        className="flex-shrink-0 flex flex-col snap-start"
                        style={{ width: columnWidth }}
                        role="group"
                        aria-label={`${column.title} column, ${count} items`}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={column.variant ?? "secondary"}
                                    className="font-medium"
                                >
                                    {column.title}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium tabular-nums">
                                    {count}
                                </span>
                            </div>
                        </div>

                        {/* Column Content — droppable zone */}
                        <DroppableColumn
                            id={column.id}
                            className={cn(
                                "flex-1 space-y-2 min-h-[200px] p-2 rounded-lg transition-colors",
                                items.length === 0
                                    ? "border-2 border-dashed border-border/50 bg-muted/10"
                                    : "bg-muted/30"
                            )}
                        >
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-1 py-8">
                                    <p className="text-sm text-muted-foreground/60">
                                        {emptyColumnState ?? "No items"}
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {items.map(renderCard)}
                                </AnimatePresence>
                            )}
                        </DroppableColumn>
                    </div>
                );
            })}
        </div>
    );

    if (!onDragEnd) {
        return (
            <>
                {isMobile && mobileContent}
                {boardContent}
            </>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {isMobile && mobileContent}
            {boardContent}
            <DragOverlay dropAnimation={shouldAnimate ? undefined : null}>
                {activeItem ? (
                    <div className="rotate-2 scale-105 shadow-xl opacity-90">
                        {renderCardContent(activeItem)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
