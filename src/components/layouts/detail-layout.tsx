"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const tabsRef = useRef<HTMLDivElement>(null);

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

    // Keyboard navigation for tabs
    const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabIndex: number) => {
        if (!tabs || !tabsRef.current) return;
        const buttons = tabsRef.current.querySelectorAll<HTMLButtonElement>("[role='tab']");
        let nextIndex = tabIndex;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            nextIndex = (tabIndex + 1) % tabs.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
            e.preventDefault();
            nextIndex = 0;
        } else if (e.key === "End") {
            e.preventDefault();
            nextIndex = tabs.length - 1;
        } else {
            return;
        }

        buttons[nextIndex]?.focus();
        onTabChange?.(tabs[nextIndex].id);
    }, [tabs, onTabChange]);

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
                    {avatar && (
                        <div className="shrink-0">
                            {avatar}
                        </div>
                    )}
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

            {/* Tabs — keyboard navigable */}
            {tabs && tabs.length > 0 && (
                <div
                    ref={tabsRef}
                    className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide"
                    role="tablist"
                    aria-label="Detail tabs"
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`tabpanel-${tab.id}`}
                            tabIndex={activeTab === tab.id ? 0 : -1}
                            onClick={() => onTabChange?.(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "ml-2 text-xs px-1.5 py-0.5 rounded-full tabular-nums",
                                    activeTab === tab.id
                                        ? "bg-primary/15 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Content — responsive sidebar */}
            {sidebar ? (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0" role="tabpanel" id={activeTab ? `tabpanel-${activeTab}` : undefined}>
                        {children}
                    </div>
                    <aside className="w-full lg:w-80 shrink-0">{sidebar}</aside>
                </div>
            ) : (
                <div role="tabpanel" id={activeTab ? `tabpanel-${activeTab}` : undefined}>
                    {children}
                </div>
            )}
        </div>
    );
}
