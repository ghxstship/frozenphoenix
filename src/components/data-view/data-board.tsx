"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA BOARD — ClickUp-Style Kanban Board View
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type FieldConfig, FieldRenderer, type FieldType } from "./field-renderers";
import type { BadgeVariant } from "@/config/ui-variants";

// ─── Column Definition ───
export interface BoardColumn<T> {
    id: string;
    title: string;
    variant?: BadgeVariant;
    filter: (item: T) => boolean;
    count?: number;
}

// ─── Card Field Definition ───
export interface CardField<T> {
    id: string;
    label?: string;
    accessorKey?: keyof T;
    accessorFn?: (row: T) => unknown;
    fieldType?: FieldType;
    fieldConfig?: Partial<FieldConfig>;
    render?: (value: unknown, row: T) => React.ReactNode;
    position?: "header" | "body" | "footer";
}

// ─── Board Props ───
interface DataBoardProps<T> {
    data: T[];
    columns: BoardColumn<T>[];
    keyField: keyof T;
    cardFields: CardField<T>[];
    // Card rendering
    cardTitle: keyof T | ((row: T) => string);
    cardSubtitle?: keyof T | ((row: T) => string);
    // Interactions
    onCardClick?: (item: T) => void;
    onDragEnd?: (itemId: string, fromColumn: string, toColumn: string) => void;
    // Styling
    columnWidth?: number;
    cardClassName?: string;
    className?: string;
    // Empty state
    emptyColumnState?: React.ReactNode;
}

export function DataBoard<T extends object>({
    data,
    columns,
    keyField,
    cardFields,
    cardTitle,
    cardSubtitle,
    onCardClick,
    columnWidth = 300,
    cardClassName,
    className,
    emptyColumnState,
}: DataBoardProps<T>) {
    // ─── Group Data by Column ───
    const groupedData = React.useMemo(() => {
        const groups: Record<string, T[]> = {};
        columns.forEach((col) => {
            groups[col.id] = data.filter(col.filter);
        });
        return groups;
    }, [data, columns]);

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

    // ─── Render Card ───
    const renderCard = (item: T) => {
        const key = String(item[keyField]);
        const title = getTitle(item);
        const subtitle = getSubtitle(item);

        const headerFields = cardFields.filter((f) => f.position === "header");
        const bodyFields = cardFields.filter((f) => !f.position || f.position === "body");
        const footerFields = cardFields.filter((f) => f.position === "footer");

        return (
            <div
                key={key}
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
                <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{title}</h4>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{subtitle}</p>
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
            </div>
        );
    };

    return (
        <div
            className={cn(
                "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth",
                "scrollbar-thin",
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

                        {/* Column Content */}
                        <div
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
                                items.map(renderCard)
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
