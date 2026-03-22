"use client";

/* ═══════════════════════════════════════════════════════════════
   FIELD GRID — Declarative 2-column field layout using FieldRenderer
   
   Renders a list of DetailFieldDef as label/value pairs in a
   responsive 2-column grid. Used by DetailPageShell for overview
   and sidebar sections.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldRenderer } from "@/components/data-view/field-renderers";
import type { DetailFieldDef } from "@/types/detail-page-config";
import { getNestedValue } from "@/lib/formatters/record-utils";
import type { EntityRecord } from "@/types/entity";

interface FieldGridProps {
    fields: DetailFieldDef[];
    record: EntityRecord;
    /** Single column layout (for sidebars) */
    singleColumn?: boolean;
    className?: string;
}

export function FieldGrid({ fields, record, singleColumn = false, className }: FieldGridProps) {
    return (
        <dl
            className={cn(
                "grid gap-x-6 gap-y-4",
                singleColumn ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
                className
            )}
        >
            {fields.map((field) => {
                const value = field.accessorFn
                    ? field.accessorFn(record)
                    : field.accessorKey
                      ? getNestedValue(record, field.accessorKey)
                      : undefined;

                return (
                    <div
                        key={field.id}
                        className={cn(
                            "min-w-0",
                            !singleColumn && field.fullWidth && "sm:col-span-2"
                        )}
                    >
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                            {field.icon && <field.icon className="h-3.5 w-3.5 shrink-0" />}
                            {field.label}
                        </dt>
                        <dd className="text-sm font-medium truncate">
                            {field.render ? (
                                field.render(value, record)
                            ) : field.fieldType ? (
                                <FieldRenderer
                                    value={value}
                                    config={{ type: field.fieldType, ...field.fieldConfig }}
                                />
                            ) : value != null && value !== "" ? (
                                String(value)
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}

FieldGrid.displayName = "FieldGrid";
