"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { ActivityAction } from "@/types";
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    UserPlus,
    MessageSquare,
    CheckCircle,
    XCircle,
} from "lucide-react";

const ACTION_CONFIG: Record<ActivityAction, { icon: typeof Plus; label: string; color: string }> = {
    created: { icon: Plus, label: "Created", color: "text-success" },
    updated: { icon: Pencil, label: "Updated", color: "text-info" },
    deleted: { icon: Trash2, label: "Deleted", color: "text-destructive" },
    status_changed: { icon: RefreshCw, label: "Status Changed", color: "text-warning" },
    assigned: { icon: UserPlus, label: "Assigned", color: "text-primary" },
    commented: { icon: MessageSquare, label: "Commented", color: "text-muted-foreground" },
    approved: { icon: CheckCircle, label: "Approved", color: "text-success" },
    rejected: { icon: XCircle, label: "Rejected", color: "text-destructive" },
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
}

export function ActivityFeed({ items, className, maxItems }: ActivityFeedProps) {
    const displayItems = maxItems ? items.slice(0, maxItems) : items;

    if (displayItems.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground">
                No activity yet
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {displayItems.map((item, index) => {
                const config = ACTION_CONFIG[item.action];
                const Icon = config.icon;

                return (
                    <StaggerItem key={item.id} index={index} stagger="tight">
                    <div
                        className="flex gap-3"
                    >
                        <div className="relative">
                            <Avatar name={item.actorName} size="sm" />
                            <div className={cn(
                                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center",
                                config.color
                            )}>
                                <Icon className="h-2.5 w-2.5" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm">
                                <span className="font-medium">{item.actorName}</span>
                                {" "}
                                <span className="text-muted-foreground">{config.label.toLowerCase()}</span>
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
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {formatRelativeTime(item.createdAt)}
                            </p>
                        </div>
                    </div>
                    </StaggerItem>
                );
            })}
        </div>
    );
}
