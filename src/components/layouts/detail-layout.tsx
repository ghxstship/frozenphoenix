"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/ui/back-link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabBar } from "@/components/ui/tab-bar";
import type { TabBarItem } from "@/components/ui/tab-bar";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { MoreHorizontal } from "lucide-react";
import { MessagingButton } from "@/components/messaging/messaging-button";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";

export interface DetailLayoutProps {
    backHref: string;
    backLabel?: string;
    title: string;
    subtitle?: string;
    status?: string;
    avatar?: React.ReactNode;
    actions?: React.ReactNode;
    menuItems?: { label: string; onClick: () => void; variant?: "default" | "destructive" }[];
    tabs?: TabBarItem[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    sidebar?: React.ReactNode;
    /** Entity type for messaging context (e.g. "project", "event"). Enables MessagingButton when provided with entityId. */
    entityType?: string;
    /** Entity ID for messaging context. Enables MessagingButton when provided with entityType. */
    entityId?: string;
    className?: string;
    children: React.ReactNode;
}

export function DetailLayout({
    backHref,
    backLabel = "Back",
    title,
    subtitle,
    status,
    avatar,
    actions,
    menuItems,
    tabs,
    activeTab,
    onTabChange,
    sidebar,
    entityType,
    entityId,
    className,
    children,
}: DetailLayoutProps) {
    const { messagingEnabled } = useMessagingEnabled();
    const tabIdPrefix = `detail-layout-${React.useId().replace(/:/g, "")}`;
    const resolvedActiveTab = activeTab ?? tabs?.[0]?.id;

    return (
        <div className={cn("motion-safe:animate-fade-in", className)}>
            {/* Back Link */}
            <BackLink href={backHref} label={backLabel} />

            {/* Header */}
            <div
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                style={{ marginBottom: "var(--density-detail-header-mb)" }}
            >
                <div className="flex items-start gap-4 min-w-0">
                    {avatar && <div className="shrink-0">{avatar}</div>}
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
                            {status && (
                                <Badge variant={getStatusVariant(status)}>
                                    {getStatusLabel(status)}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-muted-foreground mt-1 truncate">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {messagingEnabled && entityType && entityId && (
                        <MessagingButton entityType={entityType} entityId={entityId} />
                    )}
                    {actions}
                    {menuItems && menuItems.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="More actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {menuItems.map((item, i) => (
                                    <DropdownMenuItem
                                        key={i}
                                        onClick={item.onClick}
                                        className={
                                            item.variant === "destructive"
                                                ? "text-destructive"
                                                : undefined
                                        }
                                    >
                                        {item.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {tabs && tabs.length > 0 && resolvedActiveTab && (
                <div style={{ marginBottom: "var(--density-detail-header-mb)" }}>
                    <TabBar
                        items={tabs}
                        value={resolvedActiveTab}
                        onValueChange={(id) => onTabChange?.(id)}
                        idPrefix={tabIdPrefix}
                        ariaLabel="Detail tabs"
                        className="overflow-x-auto scrollbar-hide"
                    />
                </div>
            )}

            {/* Content — responsive sidebar */}
            {sidebar ? (
                <div className="flex flex-col lg:flex-row density-gap-page">
                    <div
                        className="flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        role={resolvedActiveTab ? "tabpanel" : undefined}
                        id={
                            resolvedActiveTab
                                ? `${tabIdPrefix}-tabpanel-${resolvedActiveTab}`
                                : undefined
                        }
                        aria-labelledby={
                            resolvedActiveTab
                                ? `${tabIdPrefix}-tab-${resolvedActiveTab}`
                                : undefined
                        }
                        tabIndex={resolvedActiveTab ? 0 : undefined}
                    >
                        {children}
                    </div>
                    <aside className="w-full lg:w-80 shrink-0">{sidebar}</aside>
                </div>
            ) : (
                <div
                    className={
                        resolvedActiveTab
                            ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            : undefined
                    }
                    role={resolvedActiveTab ? "tabpanel" : undefined}
                    id={
                        resolvedActiveTab
                            ? `${tabIdPrefix}-tabpanel-${resolvedActiveTab}`
                            : undefined
                    }
                    aria-labelledby={
                        resolvedActiveTab ? `${tabIdPrefix}-tab-${resolvedActiveTab}` : undefined
                    }
                    tabIndex={resolvedActiveTab ? 0 : undefined}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
