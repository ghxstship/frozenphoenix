"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { ActivityAction } from "@/types";
import {
    CheckCircle,
    MessageSquare,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    UserPlus,
    XCircle,
} from "lucide-react";

const ACTION_CONFIG: Record<
    ActivityAction,
    { icon: typeof Plus; label: string; color: string; bg: string }
> = {
    created: { icon: Plus, label: "Created", color: "text-success", bg: "bg-success/10" },
    updated: { icon: Pencil, label: "Updated", color: "text-info", bg: "bg-info/10" },
    deleted: { icon: Trash2, label: "Deleted", color: "text-destructive", bg: "bg-destructive/10" },
    status_changed: {
        icon: RefreshCw,
        label: "Status Changed",
        color: "text-warning",
        bg: "bg-warning/10",
    },
    assigned: { icon: UserPlus, label: "Assigned", color: "text-primary", bg: "bg-primary/10" },
    commented: {
        icon: MessageSquare,
        label: "Commented",
        color: "text-muted-foreground",
        bg: "bg-muted",
    },
    approved: { icon: CheckCircle, label: "Approved", color: "text-success", bg: "bg-success/10" },
    rejected: {
        icon: XCircle,
        label: "Rejected",
        color: "text-destructive",
        bg: "bg-destructive/10",
    },
};

export interface ActivityItem {
    id: string;
    action: ActivityAction;
    actorName: string;
    actorInitials?: string;
    entityType: string;
    entityName?: string;
    description?: string;
    createdAt: string;
}

export interface ActivityFeedProps {
    items: ActivityItem[];
    className?: string;
    maxItems?: number;
    compact?: boolean;
}

export function ActivityFeed({ items, className, maxItems, compact = false }: ActivityFeedProps) {
    const displayItems = maxItems ? items.slice(0, maxItems) : items;

    if (displayItems.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground" role="status">
                No activity yet
            </div>
        );
    }

    return (
        <div className={cn("relative", className)} role="feed" aria-label="Activity feed">
            {displayItems.map((item, index) => {
                const config = ACTION_CONFIG[item.action];
                const Icon = config.icon;
                const isLast = index === displayItems.length - 1;

                return (
                    <StaggerItem key={item.id} index={index} stagger="tight">
                        <div
                            className={cn(
                                "group relative flex gap-3 rounded-lg transition-colors",
                                compact ? "py-2 px-2" : "py-3 px-2",
                                "hover:bg-muted/40"
                            )}
                            role="article"
                            aria-label={`${item.actorName} ${config.label.toLowerCase()} ${item.entityName ?? ""}`}
                        >
                            {/* Timeline connector */}
                            <div className="relative shrink-0">
                                <Avatar name={item.actorName} size="sm" />
                                <div
                                    className={cn(
                                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-background flex items-center justify-center",
                                        config.bg,
                                        config.color
                                    )}
                                >
                                    <Icon className="h-2.5 w-2.5" />
                                </div>
                                {/* Vertical line connecting items */}
                                {!isLast && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 top-full w-px bg-border"
                                        style={{ height: compact ? 8 : 12 }}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm leading-snug">
                                    <span className="font-medium">{item.actorName}</span>{" "}
                                    <span className="text-muted-foreground">
                                        {config.label.toLowerCase()}
                                    </span>
                                    {item.entityName && (
                                        <>
                                            {" "}
                                            <span className="font-medium">{item.entityName}</span>
                                        </>
                                    )}
                                </p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {item.description}
                                    </p>
                                )}
                                <time
                                    className="density-caption text-muted-foreground/60 mt-1 block"
                                    dateTime={item.createdAt}
                                >
                                    {formatRelativeTime(item.createdAt)}
                                </time>
                            </div>
                        </div>
                    </StaggerItem>
                );
            })}
        </div>
    );
}
