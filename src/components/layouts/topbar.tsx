"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOCK_NOTIFICATIONS } from "@/lib/demo-data";
import { useNotifications, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { useSidebar } from "@/hooks/use-sidebar";
import { useTheme } from "@/components/theme-provider";
import {
    Bell,
    Search,
    Menu,
    Sun,
    Moon,
    Monitor,
    Settings,
    ChevronRight,
    Command,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function ThemeSwitcher() {
    const { colorMode, setColorMode } = useTheme();
    const modes = [
        { mode: "light" as const, icon: Sun, label: "Light" },
        { mode: "dark" as const, icon: Moon, label: "Dark" },
        { mode: "system" as const, icon: Monitor, label: "System" },
    ];
    const currentIndex = modes.findIndex((m) => m.mode === colorMode);
    const next = modes[(currentIndex + 1) % modes.length];

    return (
        <button
            onClick={() => setColorMode(next.mode)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Switch to ${next.label} mode`}
            title={`Theme: ${colorMode} — click for ${next.label}`}
        >
            {colorMode === "light" && <Sun className="h-4 w-4" />}
            {colorMode === "dark" && <Moon className="h-4 w-4" />}
            {colorMode === "system" && <Monitor className="h-4 w-4" />}
        </button>
    );
}

export function Topbar() {
    const pathname = usePathname();
    const { isMobile, setOpen } = useSidebar();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const { data: sbNotifications } = useNotifications();
    const notifications = isSupabaseConfigured && sbNotifications ? sbNotifications : MOCK_NOTIFICATIONS;
    const unreadCount = notifications.filter((n) => !n.read).length;

    // Build breadcrumb from path
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((seg, i) => ({
        label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
        path: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));

    // Click-outside to close notifications
    useEffect(() => {
        if (!showNotifications) return;
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowNotifications(false);
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [showNotifications]);

    // Open command bar via Cmd+K
    const openCommandBar = useCallback(() => {
        const event = new KeyboardEvent("keydown", {
            key: "k",
            metaKey: true,
            bubbles: true,
        });
        document.dispatchEvent(event);
    }, []);

    return (
        <header
            className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6"
            role="banner"
        >
            {/* Left: Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
                {isMobile && (
                    <button
                        onClick={() => setOpen(true)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {/* Desktop Breadcrumbs — clickable links */}
                <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-1 min-w-0">
                        {breadcrumbs.map((crumb, i) => (
                            <li key={crumb.path} className="flex items-center gap-1 min-w-0">
                                {i > 0 && (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" aria-hidden="true" />
                                )}
                                {crumb.isLast ? (
                                    <span className="font-semibold text-foreground truncate">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.path}
                                        className="font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Mobile: Show only current page */}
                <span className="sm:hidden text-sm font-semibold truncate">
                    {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
                </span>
            </div>

            {/* Center: Command bar trigger */}
            <button
                onClick={openCommandBar}
                className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Open command bar"
            >
                <Search className="h-3.5 w-3.5" />
                <span>Search...</span>
                <kbd className="flex items-center gap-0.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50">
                    <Command className="h-2.5 w-2.5" />K
                </kbd>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                {/* Mobile search trigger */}
                <button
                    onClick={openCommandBar}
                    className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Search"
                >
                    <Search className="h-4 w-4" />
                </button>

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
                        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                        aria-expanded={showNotifications}
                        aria-haspopup="true"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold px-1">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div
                            className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-80 max-w-sm spatial-card p-0 animate-slide-down overflow-hidden z-50"
                            role="dialog"
                            aria-label="Notifications"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <h3 className="text-sm font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button className="text-[11px] text-primary hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer",
                                                !notif.read && "bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                {!notif.read && (
                                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Unread" />
                                                )}
                                                <Badge
                                                    variant={
                                                        notif.type === "error" ? "destructive" :
                                                            notif.type === "warning" ? "warning" :
                                                                notif.type === "success" ? "success" : "info"
                                                    }
                                                    className="mt-0.5 text-[9px] px-1.5 shrink-0"
                                                >
                                                    {notif.type}
                                                </Badge>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium">{notif.title}</p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-4 py-2 border-t border-border bg-muted/30">
                                <Link
                                    href="/notifications"
                                    className="text-[11px] text-primary hover:underline font-medium"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <Link
                    href="/settings"
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Settings"
                >
                    <Settings className="h-4 w-4" />
                </Link>
            </div>
        </header>
    );
}
