"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ENTITY_RELATIONSHIP_MAP } from "@/config/production-config";
import type { EntityType, LinkedRecord } from "@/types/production";
import { ChevronRight, ExternalLink } from "lucide-react";

interface LinkedRecordCardProps {
    record: LinkedRecord;
    variant?: "compact" | "default" | "detailed" | undefined;
    showNavigation?: boolean | undefined;
    metadata?: { label: string; value: string }[] | undefined;
    onClick?: (() => void) | undefined;
    className?: string | undefined;
}

export function LinkedRecordCard({
    record,
    variant = "default",
    showNavigation = true,
    metadata,
    onClick,
    className,
}: LinkedRecordCardProps) {
    const config = ENTITY_RELATIONSHIP_MAP[record.type];
    if (!config) return null;

    const Icon = config.icon;
    const href = `${config.path}/${record.id}`;

    const content = (
        <Card
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border border-border",
                "hover:bg-secondary/50 hover:border-border/80 hover:shadow-sm transition-all duration-200",
                onClick &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            role={onClick ? "button" : undefined}
            aria-label={record.name}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <CardContent
                className={cn("flex items-center gap-3", variant === "compact" ? "p-0" : "pt-4")}
            >
                <div
                    className={cn(
                        variant === "compact" ? "h-8 w-8" : "h-10 w-10",
                        "shrink-0 rounded-lg flex items-center justify-center bg-primary/10 text-primary"
                    )}
                >
                    <Icon className={variant === "compact" ? "h-4 w-4" : "h-5 w-5"} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "font-medium truncate",
                                variant === "compact" ? "text-sm" : "text-base"
                            )}
                        >
                            {record.name}
                        </span>
                        {record.status && (
                            <Badge variant="secondary" className="density-caption shrink-0">
                                {record.status}
                            </Badge>
                        )}
                    </div>

                    {variant !== "compact" && (
                        <p className="text-xs text-muted-foreground">{config.label}</p>
                    )}

                    {variant === "detailed" && metadata && metadata.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {metadata.map((item) => (
                                <div key={item.label} className="text-xs">
                                    <span className="text-muted-foreground">{item.label}: </span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showNavigation && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                )}
            </CardContent>
        </Card>
    );

    if (onClick) {
        return <div onClick={onClick}>{content}</div>;
    }

    return <Link href={href}>{content}</Link>;
}

interface LinkedRecordListProps {
    title: string;
    records: LinkedRecord[];
    entityType: EntityType;
    emptyMessage?: string | undefined;
    maxItems?: number | undefined;
    showViewAll?: boolean | undefined;
    viewAllHref?: string | undefined;
    variant?: "compact" | "default" | undefined;
    className?: string | undefined;
}

export function LinkedRecordList({
    title,
    records,
    entityType,
    emptyMessage = "No records found",
    maxItems = 5,
    showViewAll = true,
    viewAllHref,
    variant = "default",
    className,
}: LinkedRecordListProps) {
    const config = ENTITY_RELATIONSHIP_MAP[entityType];
    const displayRecords = maxItems ? records.slice(0, maxItems) : records;
    const hasMore = records.length > maxItems;

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    {config && <config.icon className="h-4 w-4 text-muted-foreground" />}
                    {title}
                    <Badge variant="secondary" className="density-caption">
                        {records.length}
                    </Badge>
                </h3>
                {showViewAll && hasMore && viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        View all
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                )}
            </div>

            {records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {displayRecords.map((record) => (
                        <LinkedRecordCard key={record.id} record={record} variant={variant} />
                    ))}
                </div>
            )}
        </div>
    );
}
