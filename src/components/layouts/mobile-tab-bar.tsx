"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useBreakpoint } from "@/hooks/use-media-query";
import { CalendarDays, CheckSquare, Home, Mail, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Tab Configuration ──

interface MobileTab {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    /** If true, this tab opens the sidebar drawer instead of navigating */
    openDrawer?: boolean;
}

const MOBILE_TABS: MobileTab[] = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/home/tasks" },
    { id: "calendar", label: "Calendar", icon: CalendarDays, path: "/calendar" },
    { id: "messages", label: "Messages", icon: Mail, path: "/messages" },
    { id: "more", label: "More", icon: Menu, path: "#more", openDrawer: true },
];

// ── Component ──

export function MobileTabBar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { isDesktop } = useBreakpoint();
    const setOpen = useSidebar((s) => s.setOpen);

    // Don't render on desktop
    if (isDesktop) return null;

    const activeTab = MOBILE_TABS.find(
        (tab) => !tab.openDrawer && (pathname === tab.path || pathname.startsWith(tab.path + "/"))
    );

    return (
        <nav
            role="navigation"
            aria-label="Mobile navigation"
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md",
                "pb-[env(safe-area-inset-bottom)]",
                "lg:hidden",
                className
            )}
        >
            <div className="flex h-[60px] items-center justify-around px-2">
                {MOBILE_TABS.map((tab) => {
                    const isActive = activeTab?.id === tab.id;
                    const Icon = tab.icon;

                    if (tab.openDrawer) {
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setOpen(true)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-lg transition-all",
                                    "text-muted-foreground hover:text-foreground active:scale-95"
                                )}
                                aria-label={tab.label}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[11px] font-medium leading-none">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={tab.id}
                            href={tab.path}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-lg transition-all",
                                isActive
                                    ? "text-primary scale-105"
                                    : "text-muted-foreground hover:text-foreground active:scale-95"
                            )}
                            aria-label={tab.label}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5 transition-transform",
                                    isActive && "stroke-[2.5px]"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[11px] leading-none transition-colors",
                                    isActive ? "font-semibold" : "font-medium"
                                )}
                            >
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
