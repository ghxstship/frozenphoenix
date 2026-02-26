"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA CARDS — ClickUp-Style Card Grid View
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldRenderer, type FieldConfig, type FieldType } from "./field-renderers";
import { ProgressField } from "./field-renderers";

// ─── Card Field Definition ───
export interface CardFieldDef<T> {
    id: string;
    label?: string;
    accessorKey?: keyof T;
    accessorFn?: (row: T) => unknown;
    fieldType?: FieldType;
    fieldConfig?: Partial<FieldConfig>;
    render?: (value: unknown, row: T) => React.ReactNode;
    span?: 1 | 2;
}

// ─── Cards Props ───
interface DataCardsProps<T> {
    data: T[];
    keyField: keyof T;
    // Card content
    title: keyof T | ((row: T) => string);
    subtitle?: keyof T | ((row: T) => string);
    image?: keyof T | ((row: T) => string | undefined);
    badge?: keyof T | ((row: T) => React.ReactNode);
    progress?: keyof T | ((row: T) => number | undefined);
    fields: CardFieldDef<T>[];
    // Actions
    actions?: (row: T) => React.ReactNode;
    onCardClick?: (row: T) => void;
    // Layout
    columns?: 1 | 2 | 3 | 4;
    gap?: "sm" | "md" | "lg";
    // Styling
    cardClassName?: string;
    className?: string;
    // Empty state
    emptyState?: React.ReactNode;
}

export function DataCards<T extends Record<string, unknown>>({
    data,
    keyField,
    title,
    subtitle,
    image,
    badge,
    progress,
    fields,
    actions,
    onCardClick,
    columns = 3,
    gap = "md",
    cardClassName,
    className,
    emptyState,
}: DataCardsProps<T>) {
    // ─── Get Value Helpers ───
    const getValue = <R,>(row: T, accessor: keyof T | ((row: T) => R)): R | undefined => {
        if (typeof accessor === "function") return accessor(row);
        return row[accessor] as R | undefined;
    };

    const getFieldValue = (row: T, field: CardFieldDef<T>): unknown => {
        if (field.accessorFn) return field.accessorFn(row);
        if (field.accessorKey) return row[field.accessorKey];
        return undefined;
    };

    // ─── Grid Classes ───
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    };

    const gapClasses = {
        sm: "gap-3",
        md: "gap-4",
        lg: "gap-6",
    };

    // ─── Render Field ───
    const renderField = (row: T, field: CardFieldDef<T>) => {
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

        if (value == null) {
            return <span className="text-muted-foreground">—</span>;
        }

        return <span className="text-sm">{String(value)}</span>;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground animate-fade-in">
                {emptyState ?? "No data available"}
            </div>
        );
    }

    return (
        <div className={cn("grid", gridCols[columns], gapClasses[gap], className)} role="list" aria-label="Data cards">
            {data.map((row) => {
                const key = String(row[keyField]);
                const titleValue = getValue(row, title) ?? "";
                const subtitleValue = subtitle ? getValue(row, subtitle) : undefined;
                const imageValue = image ? getValue(row, image) : undefined;
                const badgeValue = badge ? getValue(row, badge) : undefined;
                const progressValue = progress ? getValue(row, progress) : undefined;

                return (
                    <Card
                        key={key}
                        className={cn(
                            "overflow-hidden transition-all duration-200 group",
                            onCardClick && "cursor-pointer hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            cardClassName
                        )}
                        onClick={() => onCardClick?.(row)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if ((e.key === "Enter" || e.key === " ") && onCardClick) {
                                e.preventDefault();
                                onCardClick(row);
                            }
                        }}
                        role="listitem"
                        tabIndex={onCardClick ? 0 : undefined}
                        aria-label={String(titleValue)}
                    >
                        {/* Image Header */}
                        {imageValue && (
                            <div className="aspect-video bg-muted overflow-hidden">
                                <Image
                                    src={imageValue as string}
                                    alt={String(titleValue)}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                                        {String(titleValue)}
                                    </CardTitle>
                                    {subtitleValue && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                            {String(subtitleValue)}
                                        </p>
                                    )}
                                </div>
                                {badgeValue && <div className="flex-shrink-0">{badgeValue}</div>}
                            </div>

                            {/* Progress Bar */}
                            {progressValue !== undefined && (
                                <div className="mt-3">
                                    <ProgressField value={progressValue as number} size="sm" />
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="pt-0">
                            {/* Fields Grid */}
                            {fields.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {fields.map((field) => {
                                        const value = getFieldValue(row, field);
                                        if (value == null && !field.render) return null;

                                        return (
                                            <div
                                                key={field.id}
                                                className={cn(
                                                    "flex flex-col",
                                                    field.span === 2 && "col-span-2"
                                                )}
                                            >
                                                {field.label && (
                                                    <span className="text-xs text-muted-foreground mb-0.5">
                                                        {field.label}
                                                    </span>
                                                )}
                                                {renderField(row, field)}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Actions */}
                            {actions && (
                                <div
                                    className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {actions(row)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
