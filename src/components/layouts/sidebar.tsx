"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { navigationConfig, type NavItem } from "@/config/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { brandConfig } from "@/config/brand";
import { LAYOUT, BREAKPOINTS } from "@/config/design-tokens";
import { useSidebar } from "@/hooks/use-sidebar";
import { Tooltip } from "@/components/ui/tooltip";
import {
    ChevronDown,
    PanelLeftClose,
    PanelLeft,
    Flame,
    X,
    LogOut,
    Loader2,
    Search,
    Pin,
    PinOff,
    Star,
} from "lucide-react";

const SIDEBAR_WIDTH = LAYOUT.sidebar;

function SidebarNavItem({
    item,
    isActive,
    collapsed,
    isMobile,
    isPinned,
    onTogglePin,
}: {
    item: NavItem;
    isActive: boolean;
    collapsed: boolean;
    isMobile: boolean;
    isPinned: boolean;
    onTogglePin: (path: string) => void;
}) {
    const Icon = item.icon;
    const [showPinAction, setShowPinAction] = useState(false);

    const content = (
        <Link
            href={item.path}
            onMouseEnter={() => setShowPinAction(true)}
            onMouseLeave={() => setShowPinAction(false)}
            className={cn(
                "group relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed && !isMobile ? "justify-center px-2 py-2.5" : "px-2.5 py-2",
                isActive
                    ? "bg-sidebar-primary/12 text-sidebar-primary"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
        >
            {isActive && (
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary transition-all duration-300"
                    aria-hidden="true"
                />
            )}
            <Icon className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
            )} />
            {(!collapsed || isMobile) && (
                <>
                    <span className="truncate flex-1">{item.title}</span>
                    {item.badge && (
                        <span className="text-[10px] font-bold bg-sidebar-primary/20 text-sidebar-primary px-1.5 py-0.5 rounded-full">
                            {item.badge}
                        </span>
                    )}
                    {showPinAction && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onTogglePin(item.path);
                            }}
                            className={cn(
                                "h-5 w-5 rounded flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                                isPinned
                                    ? "text-sidebar-primary hover:text-sidebar-primary/70"
                                    : "text-sidebar-foreground/30 hover:text-sidebar-foreground/60"
                            )}
                            aria-label={isPinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                        >
                            {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                        </button>
                    )}
                </>
            )}
        </Link>
    );

    if (collapsed && !isMobile) {
        return (
            <Tooltip content={item.title} side="right" delayDuration={100}>
                {content}
            </Tooltip>
        );
    }

    return content;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, loading: authLoading, signOut } = useAuth();
    const {
        isOpen, isCollapsed, isMobile, filterQuery, pinnedPaths,
        setOpen, setMobile, setFilterQuery, togglePin, toggleCollapse,
    } = useSidebar();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        Object.fromEntries(navigationConfig.map((s) => [s.title, s.defaultExpanded ?? false]))
    );
    const [signingOut, setSigningOut] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const collapsed = isMobile ? false : isCollapsed;
    const sidebarWidth = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;

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

    // Scroll active item into view on mount
    useEffect(() => {
        if (!navRef.current) return;
        const timer = setTimeout(() => {
            const active = navRef.current?.querySelector("[aria-current='page']");
            active?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Keyboard shortcut: / to focus sidebar search
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
                if (collapsed && !isMobile) return;
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [collapsed, isMobile]);

    const toggleSection = useCallback((title: string) => {
        setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
    }, []);

    // Build pinned items from all navigation sections
    const pinnedItems = useMemo(() => {
        if (pinnedPaths.length === 0) return [];
        const allItems: NavItem[] = [];
        navigationConfig.forEach((s) => s.items.forEach((i) => allItems.push(i)));
        return pinnedPaths
            .map((path) => allItems.find((i) => i.path === path))
            .filter(Boolean) as NavItem[];
    }, [pinnedPaths]);

    // Filter sections based on search query
    const filteredSections = useMemo(() => {
        if (!filterQuery.trim()) return navigationConfig;
        const q = filterQuery.toLowerCase();
        return navigationConfig
            .map((section) => ({
                ...section,
                items: section.items.filter(
                    (item) =>
                        item.title.toLowerCase().includes(q) ||
                        item.path.toLowerCase().includes(q)
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [filterQuery]);

    // When filtering, treat all sections as expanded (derived, no setState needed)
    const isFiltering = filterQuery.trim().length > 0;
    const isSectionExpanded = useCallback((title: string) => {
        return isFiltering || (expandedSections[title] ?? false);
    }, [isFiltering, expandedSections]);

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
                <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
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

                {/* Inline Search */}
                {(!collapsed || isMobile) && (
                    <div className="px-3 py-2 border-b border-sidebar-border shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/30" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Filter nav…"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                className="w-full h-8 pl-8 pr-8 rounded-md bg-sidebar-accent/50 border border-sidebar-border/50 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-1 focus:ring-sidebar-primary/50 transition-colors"
                                aria-label="Filter navigation"
                            />
                            {filterQuery ? (
                                <button
                                    onClick={() => setFilterQuery("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                                    aria-label="Clear filter"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : (
                                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-sidebar-foreground/25 bg-sidebar-accent px-1 py-0.5 rounded font-mono">
                                    /
                                </kbd>
                            )}
                        </div>
                    </div>
                )}

                {/* Nav Sections */}
                <nav ref={navRef} className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
                    {/* Pinned / Favorites Section */}
                    {pinnedItems.length > 0 && !filterQuery && (
                        <div className="mb-2">
                            {(!collapsed || isMobile) && (
                                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-primary/60">
                                    <Star className="h-3 w-3" />
                                    Favorites
                                </div>
                            )}
                            {collapsed && !isMobile && (
                                <div className="flex justify-center py-1 mb-0.5">
                                    <Star className="h-3 w-3 text-sidebar-primary/50" />
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {pinnedItems.map((item) => {
                                    const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                                    return (
                                        <SidebarNavItem
                                            key={`pin-${item.path}`}
                                            item={item}
                                            isActive={isActive}
                                            collapsed={collapsed}
                                            isMobile={isMobile}
                                            isPinned={true}
                                            onTogglePin={togglePin}
                                        />
                                    );
                                })}
                            </div>
                            <div className="mx-2 my-2 border-t border-sidebar-border/50" />
                        </div>
                    )}

                    {/* Navigation Sections */}
                    {filteredSections.map((section) => (
                        <div key={section.title} className="mb-0.5">
                            {/* Section Header */}
                            {(!collapsed || isMobile) ? (
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/35 hover:text-sidebar-foreground/55 transition-colors"
                                    aria-expanded={isSectionExpanded(section.title)}
                                >
                                    <span>{section.title}</span>
                                    <ChevronDown className={cn(
                                        "h-3 w-3 transition-transform duration-200",
                                        !isSectionExpanded(section.title) && "-rotate-90"
                                    )} />
                                </button>
                            ) : (
                                <div className="mx-auto my-1.5 w-6 border-t border-sidebar-border/40" />
                            )}

                            {/* Section Items — animated collapse */}
                            <div
                                className={cn(
                                    "overflow-hidden transition-all duration-200",
                                    (collapsed && !isMobile) || isSectionExpanded(section.title)
                                        ? "max-h-[2000px] opacity-100"
                                        : "max-h-0 opacity-0"
                                )}
                            >
                                <div className="space-y-0.5 mt-0.5">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                                        return (
                                            <SidebarNavItem
                                                key={item.path}
                                                item={item}
                                                isActive={isActive}
                                                collapsed={collapsed}
                                                isMobile={isMobile}
                                                isPinned={pinnedPaths.includes(item.path)}
                                                onTogglePin={togglePin}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredSections.length === 0 && filterQuery && (
                        <div className="px-3 py-8 text-center">
                            <p className="text-xs text-sidebar-foreground/40">No matching pages</p>
                            <button
                                onClick={() => setFilterQuery("")}
                                className="mt-2 text-xs text-sidebar-primary hover:underline"
                            >
                                Clear filter
                            </button>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="border-t border-sidebar-border px-3 py-2.5 shrink-0">
                    {collapsed && !isMobile ? (
                        <Tooltip content={profile?.name || "Guest"} side="right">
                            <div className="flex justify-center">
                                <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground/80">
                                    {profile ? getInitials(profile.name) : "??"}
                                </div>
                            </div>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground/80 shrink-0">
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
                                    className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                                    title="Sign out"
                                    aria-label="Sign out"
                                >
                                    {signingOut ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <LogOut className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
