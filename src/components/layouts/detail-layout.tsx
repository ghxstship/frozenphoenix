"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import type { TabBarItem } from "@/components/ui/tab-bar";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

/** @deprecated Use TabBarItem from '@/components/ui/tab-bar' directly */
export type DetailTabConfig = TabBarItem;

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
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const tabIdPrefix = `detail-layout-${React.useId().replace(/:/g, "")}`;
    const resolvedActiveTab = activeTab ?? tabs?.[0]?.id;

    // Escape key to close overflow menu
    useEffect(() => {
        if (!menuOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [menuOpen]);

    // Click-outside to close menu
    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    return (
        <div className={cn("animate-fade-in", className)}>
            {/* Back Link */}
            <Link
                href={backHref}
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {backLabel}
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4 min-w-0">
                    {avatar && <div className="shrink-0">{avatar}</div>}
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold truncate">{title}</h1>
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

                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                    {menuItems && menuItems.length > 0 && (
                        <div className="relative" ref={menuRef}>
                            <Button
                                ref={menuButtonRef}
                                variant="ghost"
                                size="icon"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                                aria-label="More actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {menuOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg animate-scale-in origin-top-right"
                                    role="menu"
                                    aria-label="More actions"
                                >
                                    {menuItems.map((item, i) => (
                                        <button
                                            key={i}
                                            role="menuitem"
                                            onClick={() => {
                                                item.onClick();
                                                setMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                item.variant === "destructive"
                                                    ? "text-destructive hover:bg-destructive/10"
                                                    : "hover:bg-secondary"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {tabs && tabs.length > 0 && resolvedActiveTab && (
                <TabBar
                    items={tabs}
                    value={resolvedActiveTab}
                    onValueChange={(id) => onTabChange?.(id)}
                    idPrefix={tabIdPrefix}
                    ariaLabel="Detail tabs"
                    className="mb-6 overflow-x-auto scrollbar-hide"
                />
            )}

            {/* Content — responsive sidebar */}
            {sidebar ? (
                <div className="flex flex-col lg:flex-row gap-6">
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
