"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

export interface DetailTabConfig {
    id: string;
    label: string;
    count?: number;
}

export interface DetailLayoutProps {
    backHref: string;
    backLabel?: string;
    title: string;
    subtitle?: string;
    status?: string;
    avatar?: React.ReactNode;
    actions?: React.ReactNode;
    menuItems?: { label: string; onClick: () => void; variant?: "default" | "destructive" }[];
    tabs?: DetailTabConfig[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    sidebar?: React.ReactNode;
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
    className,
    children,
}: DetailLayoutProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={cn("animate-fade-in", className)}>
            {/* Back Link */}
            <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                    {avatar && (
                        <div className="shrink-0">
                            {avatar}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{title}</h1>
                            {status && (
                                <Badge variant={getStatusVariant(status)}>
                                    {getStatusLabel(status)}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actions}
                    {menuItems && menuItems.length > 0 && (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {menuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                                        {menuItems.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    item.onClick();
                                                    setMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                                    item.variant === "destructive"
                                                        ? "text-destructive hover:bg-destructive/10"
                                                        : "hover:bg-secondary"
                                                )}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {tabs && tabs.length > 0 && (
                <div className="flex gap-1 border-b border-border mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {sidebar ? (
                <div className="flex gap-6">
                    <div className="flex-1 min-w-0">{children}</div>
                    <aside className="w-80 shrink-0">{sidebar}</aside>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
