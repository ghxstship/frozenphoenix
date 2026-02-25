"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { brandConfig } from "@/config/brand";
import { SIDEBAR_WIDTH, BREAKPOINTS } from "@/config/constants";
import { useSidebar } from "@/hooks/use-sidebar";
import {
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeft,
    Flame,
    X,
    LogOut,
    Loader2,
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, loading: authLoading, signOut } = useAuth();
    const { isOpen, isCollapsed, isMobile, setOpen, setMobile, toggleCollapse } = useSidebar();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        Object.fromEntries(navigationConfig.map((s) => [s.title, s.defaultExpanded ?? false]))
    );
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        await signOut();
        router.push("/login");
    };

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < BREAKPOINTS.lg;
            setMobile(mobile);
            if (!mobile && isOpen) setOpen(false);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [setMobile, setOpen, isOpen]);

    useEffect(() => {
        if (isMobile && isOpen) setOpen(false);
    }, [pathname, isMobile, isOpen, setOpen]);

    const toggleSection = (title: string) => {
        setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const collapsed = isMobile ? false : isCollapsed;
    const sidebarWidth = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                id="main-navigation"
                role="navigation"
                aria-label="Main navigation"
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen flex flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-all duration-300",
                    isMobile
                        ? cn("w-[280px]", isOpen ? "translate-x-0" : "-translate-x-full")
                        : collapsed ? "w-[68px]" : "w-[260px]"
                )}
                style={{ width: isMobile ? 280 : sidebarWidth }}
                aria-hidden={isMobile && !isOpen}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                            <Flame className="h-4.5 w-4.5 text-primary-foreground" />
                        </div>
                        {(!collapsed || isMobile) && (
                            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {brandConfig.name}
                            </span>
                        )}
                    </Link>
                    {isMobile ? (
                        <button
                            onClick={() => setOpen(false)}
                            className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={toggleCollapse}
                            className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </button>
                    )}
                </div>

                {/* Nav Sections */}
                <nav className="flex-1 overflow-y-auto py-3 px-2.5">
                    {navigationConfig.map((section) => (
                        <div key={section.title} className="mb-1">
                            {/* Section Header */}
                            {(!collapsed || isMobile) && (
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
                                >
                                    {section.title}
                                    {expandedSections[section.title] ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                </button>
                            )}

                            {/* Section Items */}
                            {(collapsed && !isMobile) || expandedSections[section.title] ? (
                                <div className="space-y-0.5 mt-0.5">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.path}
                                                href={item.path}
                                                title={collapsed && !isMobile ? item.title : undefined}
                                                className={cn(
                                                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                                )}
                                            >
                                                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                                                {(!collapsed || isMobile) && <span className="truncate">{item.title}</span>}
                                                {(!collapsed || isMobile) && item.badge && (
                                                    <span className="ml-auto text-[10px] font-bold bg-sidebar-primary/20 text-sidebar-primary px-1.5 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                {(!collapsed || isMobile) && (
                    <div className="border-t border-sidebar-border px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground/80">
                                {profile ? getInitials(profile.name) : "??"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                    {authLoading ? "Loading..." : profile?.name || "Guest"}
                                </p>
                                <p className="text-[10px] text-sidebar-foreground/40 truncate capitalize">
                                    {profile?.role || "Not signed in"}
                                </p>
                            </div>
                            {profile && (
                                <button
                                    onClick={handleSignOut}
                                    disabled={signingOut}
                                    className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                                    title="Sign out"
                                >
                                    {signingOut ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogOut className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
