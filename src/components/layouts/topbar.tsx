"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { useSidebar } from "@/hooks/use-sidebar";
import {
    Bell,
    Search,
    X,
    Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
    const pathname = usePathname();
    const { isMobile, setOpen } = useSidebar();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

    // Build breadcrumb from path
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((seg, i) => ({
        label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
        path: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
            {/* Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-3">
                {isMobile && (
                    <button
                        onClick={() => setOpen(true)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}
                <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={crumb.path}>
                        {i > 0 && <span className="text-muted-foreground/40 mx-1">/</span>}
                        <span className={cn(
                            "font-medium",
                            crumb.isLast ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        )}>
                            {crumb.label}
                        </span>
                    </React.Fragment>
                ))}
                </nav>
                {/* Mobile: Show only current page */}
                <span className="sm:hidden text-sm font-medium">
                    {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Search */}
                {searchOpen ? (
                    <div className="flex items-center gap-2 animate-scale-in">
                        <Input
                            placeholder="Search projects, tasks, crew…"
                            className="w-48 sm:w-64 h-8 text-xs"
                            autoFocus
                        />
                        <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                )}

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-10 w-[calc(100vw-2rem)] sm:w-80 max-w-sm spatial-card p-0 animate-slide-down overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-border">
                                <h3 className="text-sm font-semibold">Notifications</h3>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {MOCK_NOTIFICATIONS.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer",
                                            !notif.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <Badge
                                                variant={
                                                    notif.type === "error" ? "destructive" :
                                                        notif.type === "warning" ? "warning" :
                                                            notif.type === "success" ? "success" : "info"
                                                }
                                                className="mt-0.5 text-[9px] px-1.5"
                                            >
                                                {notif.type}
                                            </Badge>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium">{notif.title}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
