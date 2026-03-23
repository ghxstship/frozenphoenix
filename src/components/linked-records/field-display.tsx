"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EntityLink } from "./entity-link";
import { Badge } from "@/components/ui/badge";
import type { EntityType } from "@/types/production";
import type { FieldCategory } from "@/config/production-config";
import { Calendar, Cog, GitBranch, HelpCircle, Link2, MapPin, User } from "lucide-react";

const CATEGORY_CONFIG: Record<FieldCategory, { label: string; icon: typeof User; color: string }> =
    {
        who: { label: "Who", icon: User, color: "text-info" },
        what: { label: "What", icon: HelpCircle, color: "text-primary" },
        when: { label: "When", icon: Calendar, color: "text-warning" },
        where: { label: "Where", icon: MapPin, color: "text-success" },
        why: { label: "Why", icon: HelpCircle, color: "text-destructive" },
        how: { label: "How", icon: Cog, color: "text-info" },
        if_then: { label: "If/Then", icon: GitBranch, color: "text-warning" },
        relationships: { label: "Relationships", icon: Link2, color: "text-primary" },
    };

interface FieldDisplayProps {
    label: string;
    value: unknown;
    type?:
        | "text"
        | "number"
        | "date"
        | "datetime"
        | "currency"
        | "boolean"
        | "reference"
        | "list"
        | undefined;
    category?: FieldCategory | undefined;
    referenceEntity?: EntityType | undefined;
    referenceId?: string | undefined;
    referenceName?: string | undefined;
    showCategory?: boolean | undefined;
    className?: string | undefined;
}

export function FieldDisplay({
    label,
    value,
    type = "text",
    category,
    referenceEntity,
    referenceId,
    referenceName,
    showCategory = false,
    className,
}: FieldDisplayProps) {
    const categoryConfig = category ? CATEGORY_CONFIG[category] : null;

    const renderValue = () => {
        if (value === null || value === undefined || value === "") {
            return <span className="text-muted-foreground italic">Not set</span>;
        }

        switch (type) {
            case "currency":
                return <span className="font-medium">{formatCurrency(value as number)}</span>;

            case "date":
                return <span>{formatDate(value as string)}</span>;

            case "datetime":
                return <span>{new Date(value as string).toLocaleString()}</span>;

            case "boolean":
                return (
                    <Badge variant={value ? "success" : "secondary"}>{value ? "Yes" : "No"}</Badge>
                );

            case "reference":
                if (referenceEntity && referenceId && referenceName) {
                    return (
                        <EntityLink
                            entityType={referenceEntity}
                            entityId={referenceId}
                            entityName={referenceName}
                            size="sm"
                        />
                    );
                }
                return <span>{String(value)}</span>;

            case "list":
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        return <span className="text-muted-foreground italic">None</span>;
                    }
                    return (
                        <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {String(item)}
                                </Badge>
                            ))}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            case "number":
                return <span className="font-medium tabular-nums">{value.toLocaleString()}</span>;

            default:
                return <span>{String(value)}</span>;
        }
    };

    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center gap-1.5">
                {showCategory && categoryConfig && (
                    <categoryConfig.icon className={cn("h-3 w-3", categoryConfig.color)} />
                )}
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-sm">{renderValue()}</div>
        </div>
    );
}

interface FieldGroupProps {
    category: FieldCategory;
    fields: Array<{
        label: string;
        value: unknown;
        type?: FieldDisplayProps["type"] | undefined;
        referenceEntity?: EntityType | undefined;
        referenceId?: string | undefined;
        referenceName?: string | undefined;
    }>;
    columns?: 1 | 2 | 3 | 4 | undefined;
    className?: string | undefined;
}

export function FieldGroup({ category, fields, columns = 2, className }: FieldGroupProps) {
    const config = CATEGORY_CONFIG[category];
    const Icon = config.icon;

    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <h4 className="text-sm font-semibold">{config.label}</h4>
            </div>
            <div className={cn("grid density-gap-card", gridCols[columns])}>
                {fields.map((field) => (
                    <FieldDisplay
                        key={field.label}
                        label={field.label}
                        value={field.value}
                        type={field.type}
                        category={category}
                        referenceEntity={field.referenceEntity}
                        referenceId={field.referenceId}
                        referenceName={field.referenceName}
                    />
                ))}
            </div>
        </div>
    );
}
