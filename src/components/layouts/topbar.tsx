"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useSidebar } from "@/hooks/use-sidebar";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/supabase/auth-context";

import { FOCUS_RING, ICON_SIZES, LAYOUT } from "@/config/design-tokens";
import { useReducedMotion } from "@/hooks/use-media-query";
import { hasPermission } from "@/config/rbac";
import {
    getContextualNavigationVisibility,
    getNavigationBreadcrumbs,
    getNavigationContext,
    getNavigationSectionsForRole,
} from "@/config/navigation";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SupportedLocale } from "@/lib/locale";
import type { PermissionLevel } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
    Briefcase,
    Building2,
    CalendarPlus,
    Check,
    ChevronDown,
    ChevronRight,
    CircleDot,
    ClipboardPlus,
    Command,
    ExternalLink,
    FileText,
    FolderPlus,
    Globe,
    HelpCircle,
    Keyboard,
    LifeBuoy,
    LogOut,
    Menu,
    MessageSquare,
    Monitor,
    Moon,
    MoreHorizontal,
    Plus,
    Search,
    Settings,
    Shield,
    Sparkles,
    Sun,
    User,
    UserPlus,
    Wifi,
    WifiOff,
} from "lucide-react";

// ─── Shared icon button with tooltip, focus ring, and consistent sizing ───

interface TopbarIconButtonProps {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    href?: string;
    badge?: number;
    active?: boolean;
    className?: string;
    "aria-expanded"?: boolean;
    "aria-haspopup"?: boolean | "menu" | "dialog";
    children?: React.ReactNode;
}

function TopbarIconButton({
    icon: Icon,
    label,
    shortcut,
    onClick,
    href,
    badge,
    active,
    className,
    children,
    ...ariaProps
}: TopbarIconButtonProps) {
    const tooltipContent = shortcut ? (
        <span className="flex items-center gap-2">
            {label}
            <kbd className="text-[10px] font-mono bg-background/20 px-1 rounded">{shortcut}</kbd>
        </span>
    ) : (
        label
    );

    const buttonClasses = cn(
        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
        "hover:text-foreground hover:bg-secondary transition-colors relative",
        FOCUS_RING,
        active && "text-foreground bg-secondary",
        className
    );

    const inner = (
        <>
            <Icon className={ICON_SIZES.sm} />
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold px-1">
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
            {children}
        </>
    );

    if (href) {
        return (
            <Tooltip content={tooltipContent} side="bottom">
                <Link href={href} className={buttonClasses} aria-label={label} {...ariaProps}>
                    {inner}
                </Link>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={tooltipContent} side="bottom">
            <button onClick={onClick} className={buttonClasses} aria-label={label} {...ariaProps}>
                {inner}
            </button>
        </Tooltip>
    );
}

// ─── Theme Switcher ───

function ThemeSwitcher() {
    const { colorMode, setColorMode } = useTheme();
    const modes = [
        { mode: "light" as const, icon: Sun, label: "Light" },
        { mode: "dark" as const, icon: Moon, label: "Dark" },
        { mode: "system" as const, icon: Monitor, label: "System" },
    ];
    const currentIndex = modes.findIndex((m) => m.mode === colorMode);
    const next = modes[(currentIndex + 1) % modes.length]!;
    const CurrentIcon = colorMode === "light" ? Sun : colorMode === "dark" ? Moon : Monitor;

    return (
        <TopbarIconButton
            icon={CurrentIcon}
            label={`Theme: ${colorMode} — click for ${next.label}`}
            shortcut="⌘."
            onClick={() => setColorMode(next.mode)}
        />
    );
}

// ─── Connection Status Indicator ───

function ConnectionIndicator() {
    const [status, setStatus] = useState<"connected" | "connecting" | "disconnected">(() =>
        isSupabaseConfigured ? "connecting" : "disconnected"
    );

    useEffect(() => {
        if (!isSupabaseConfigured) return;
        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase.channel("connection-probe");
        channel.subscribe((s) => {
            if (s === "SUBSCRIBED") setStatus("connected");
            else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("disconnected");
            else setStatus("connecting");
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (status === "connected") return null;

    const icon = status === "disconnected" ? WifiOff : Wifi;
    const color = status === "disconnected" ? "text-destructive" : "text-warning animate-pulse";

    return (
        <Tooltip
            content={status === "disconnected" ? "Offline — data may be stale" : "Reconnecting..."}
            side="bottom"
        >
            <div
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center", color)}
                role="status"
                aria-live="polite"
            >
                {React.createElement(icon, { className: ICON_SIZES.sm })}
                <span className="sr-only">
                    {status === "disconnected" ? "Disconnected" : "Reconnecting"}
                </span>
            </div>
        </Tooltip>
    );
}

// ─── Environment Badge ───

function EnvironmentBadge() {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;
    if (env === "production") return null;

    const label = env === "development" ? "Dev" : env === "preview" ? "Preview" : (env ?? "Dev");
    const variant = env === "development" ? "warning" : "info";

    return (
        <Badge
            variant={variant as "warning" | "info"}
            className="text-[9px] px-1.5 py-0 h-5 hidden sm:flex"
        >
            {label}
        </Badge>
    );
}

// ─── Locale Config ───

const LOCALE_OPTIONS: { value: SupportedLocale; label: string; flag: string }[] = [
    { value: "en-US", label: "English (US)", flag: "🇺🇸" },
    { value: "en-GB", label: "English (UK)", flag: "🇬🇧" },
    { value: "es-ES", label: "Español", flag: "🇪🇸" },
    { value: "fr-FR", label: "Français", flag: "🇫🇷" },
    { value: "de-DE", label: "Deutsch", flag: "🇩🇪" },
    { value: "pt-BR", label: "Português", flag: "🇧🇷" },
    { value: "ja-JP", label: "日本語", flag: "🇯🇵" },
    { value: "zh-CN", label: "中文", flag: "🇨🇳" },
    { value: "ar-SA", label: "العربية", flag: "🇸🇦" },
    { value: "ko-KR", label: "한국어", flag: "🇰🇷" },
];

// ─── Quick Create Actions (context-aware) ───

interface QuickCreateAction {
    label: string;
    icon: LucideIcon;
    href: string;
    resource: string;
}

const QUICK_CREATE_ACTIONS: QuickCreateAction[] = [
    {
        label: "New Project",
        icon: FolderPlus,
        href: "/projects?action=create",
        resource: "projects",
    },
    { label: "New Deal", icon: Briefcase, href: "/pipeline?action=create", resource: "deals" },
    { label: "New Task", icon: ClipboardPlus, href: "/tasks?action=create", resource: "tasks" },
    { label: "New Event", icon: CalendarPlus, href: "/events?action=create", resource: "events" },
    {
        label: "Invite Member",
        icon: UserPlus,
        href: "/onboarding/invite-team",
        resource: "invitations",
    },
];

// ─── Quick Create Dropdown ───

function QuickCreateMenu({ userRole }: { userRole: PermissionLevel }) {
    const router = useRouter();
    const visible = QUICK_CREATE_ACTIONS.filter((a) =>
        hasPermission(userRole, a.resource, "write")
    );
    if (visible.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:bg-secondary transition-colors",
                        FOCUS_RING
                    )}
                    aria-label="Quick create"
                >
                    <Plus className={ICON_SIZES.sm} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                {visible.map((action) => (
                    <DropdownMenuItem key={action.href} onClick={() => router.push(action.href)}>
                        <action.icon className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Messages Dropdown ───

function MessagesMenu() {
    const router = useRouter();
    const messageCount = 0; // TODO: wire to real unread message count

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:bg-secondary transition-colors relative",
                        FOCUS_RING
                    )}
                    aria-label={`Messages${messageCount > 0 ? ` (${messageCount} unread)` : ""}`}
                >
                    <MessageSquare className={ICON_SIZES.sm} />
                    {messageCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold px-1">
                            {messageCount > 9 ? "9+" : messageCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No messages yet
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/messages")}>
                    View all messages
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Help Dropdown ───

function HelpMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:bg-secondary transition-colors",
                        FOCUS_RING
                    )}
                    aria-label="Help and resources"
                >
                    <HelpCircle className={ICON_SIZES.sm} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => window.open("/docs", "_blank")}>
                    <FileText className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Documentation
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/50" />
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        document.dispatchEvent(
                            new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
                        );
                    }}
                >
                    <Keyboard className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Keyboard shortcuts
                    <kbd className="ml-auto text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LifeBuoy className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Contact support
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Sparkles className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    What&apos;s new
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Locale Switcher ───

function LocaleSwitcher() {
    const [current, setCurrent] = useState<SupportedLocale>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("fp-locale") as SupportedLocale) || "en-US";
        }
        return "en-US";
    });

    const handleChange = useCallback((locale: SupportedLocale) => {
        setCurrent(locale);
        if (typeof window !== "undefined") {
            localStorage.setItem("fp-locale", locale);
            // Apply RTL if needed
            const dir = locale === "ar-SA" ? "rtl" : "ltr";
            document.documentElement.dir = dir;
            document.documentElement.lang = locale;
        }
    }, []);

    const currentOption = LOCALE_OPTIONS.find((o) => o.value === current);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:bg-secondary transition-colors",
                        FOCUS_RING
                    )}
                    aria-label={`Language: ${currentOption?.label ?? current}`}
                >
                    <Globe className={ICON_SIZES.sm} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-72 overflow-y-auto">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                {LOCALE_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => handleChange(opt.value)}>
                        <span className="mr-2 text-sm">{opt.flag}</span>
                        {opt.label}
                        {opt.value === current && (
                            <Check className="h-3 w-3 ml-auto text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── User Menu (avatar + dropdown with org switcher) ───

function UserMenu() {
    const { user, profile, memberships, activeOrg, switchOrg, signOut } = useAuth();
    const router = useRouter();

    const displayName = profile?.name || user?.email?.split("@")[0] || "User";
    const displayEmail = user?.email || "";
    const initials = getInitials(displayName);
    const orgName = activeOrg?.organizations?.name || "No Organization";
    const userRole = (profile as Record<string, unknown>)?.role as PermissionLevel | undefined;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 h-8 rounded-lg px-1.5",
                        "hover:bg-secondary transition-colors",
                        FOCUS_RING
                    )}
                    aria-label="User menu"
                >
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center ring-2 ring-background shrink-0">
                        {initials}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
                        {displayName}
                    </span>
                    <ChevronDown className="hidden lg:block h-3 w-3 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                {/* User identity header */}
                <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                    {userRole && (
                        <Badge variant="secondary" className="mt-1 text-[9px] px-1.5 py-0 h-4">
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </Badge>
                    )}
                </div>
                <DropdownMenuSeparator />

                {/* Active org */}
                <DropdownMenuLabel className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    Organization
                </DropdownMenuLabel>
                <div className="px-2 pb-1">
                    {memberships.length <= 1 ? (
                        <div className="px-2 py-1 text-xs text-foreground font-medium truncate">
                            {orgName}
                        </div>
                    ) : (
                        memberships.map((m) => (
                            <DropdownMenuItem
                                key={m.organization_id}
                                onClick={() => switchOrg(m.organization_id)}
                                className="text-xs"
                            >
                                <CircleDot
                                    className={cn(
                                        "h-3 w-3 mr-2",
                                        m.organization_id === activeOrg?.organization_id
                                            ? "text-primary"
                                            : "text-muted-foreground/30"
                                    )}
                                />
                                <span className="truncate">
                                    {m.organizations?.name || m.organization_id}
                                </span>
                                {m.organization_id === activeOrg?.organization_id && (
                                    <Check className="h-3 w-3 ml-auto text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />

                {/* Navigation items */}
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                        <User className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                        Profile & Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings/security")}>
                        <Shield className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                        Security
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOut className={cn(ICON_SIZES.sm, "mr-2")} />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Responsive Overflow Menu (tablet: collapses less-used icons) ───

function OverflowMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:bg-secondary transition-colors md:hidden",
                        FOCUS_RING
                    )}
                    aria-label="More actions"
                >
                    <MoreHorizontal className={ICON_SIZES.sm} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => window.open("/docs", "_blank")}>
                    <HelpCircle className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Help
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Globe className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Language
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className={cn(ICON_SIZES.sm, "mr-2 text-muted-foreground")} />
                    Settings
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Main Topbar ───

export function Topbar() {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useSidebar((state) => state.isMobile);
    const isOpen = useSidebar((state) => state.isOpen);
    const setOpen = useSidebar((state) => state.setOpen);
    // Auth context (safe fallback for when not inside AuthProvider)
    let profile: Record<string, unknown> | null = null;
    let userRole: PermissionLevel = "pm";
    try {
        const auth = useAuth();
        profile = auth.profile as Record<string, unknown> | null;
        userRole = ((profile?.role as string) || "pm") as PermissionLevel;
    } catch {
        // Outside AuthProvider — use defaults
    }

    const contextualVisibility = useMemo(
        () => getContextualNavigationVisibility(pathname),
        [pathname]
    );
    const roleScopedSections = useMemo(
        () => getNavigationSectionsForRole(userRole, { contextualVisibility }),
        [userRole, contextualVisibility]
    );

    const activeNavContext = useMemo(
        () => getNavigationContext(pathname, roleScopedSections),
        [pathname, roleScopedSections]
    );

    // Build breadcrumbs from navigation SSOT with fallback formatting for non-nav routes.
    const breadcrumbs = useMemo(() => {
        const baseCrumbs = getNavigationBreadcrumbs(pathname, roleScopedSections);
        if (!activeNavContext?.parentItem || baseCrumbs.length === 0) {
            return baseCrumbs;
        }

        const parentPath = activeNavContext.parentItem.path;
        const hasParentCrumb = baseCrumbs.some((crumb) => crumb.path === parentPath);
        if (hasParentCrumb) {
            return baseCrumbs;
        }

        const currentCrumb = baseCrumbs[baseCrumbs.length - 1];
        if (!currentCrumb) {
            return baseCrumbs;
        }

        const leadingCrumbs = baseCrumbs.slice(0, -1).map((crumb) => ({ ...crumb, isLast: false }));
        return [
            ...leadingCrumbs,
            {
                label: activeNavContext.parentItem.title,
                path: parentPath,
                isLast: false,
            },
            {
                ...currentCrumb,
                isLast: true,
            },
        ];
    }, [pathname, activeNavContext, roleScopedSections]);

    // Breadcrumb overflow: collapse middle segments if > 3 levels deep
    const MAX_VISIBLE_CRUMBS = 3;
    const visibleCrumbs = useMemo(() => {
        if (breadcrumbs.length <= MAX_VISIBLE_CRUMBS) return breadcrumbs;
        return [
            breadcrumbs[0]!,
            {
                label: "…",
                path: breadcrumbs[breadcrumbs.length - 2]!.path,
                isLast: false,
                isEllipsis: true,
            },
            breadcrumbs[breadcrumbs.length - 1]!,
        ];
    }, [breadcrumbs]);

    // Scroll-driven topbar shrink
    const reducedMotion = useReducedMotion();
    const headerRef = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (reducedMotion) return;
        const shell = document.getElementById("shell-main-content")?.parentElement;
        const target = shell || window;

        const handleScroll = () => {
            const scrollTop = shell ? shell.scrollTop : window.scrollY;
            setIsScrolled(scrollTop > 24);
        };

        target.addEventListener("scroll", handleScroll, { passive: true });
        return () => target.removeEventListener("scroll", handleScroll);
    }, [reducedMotion]);

    // Open command bar via Cmd+K
    const openCommandBar = useCallback(() => {
        const event = new KeyboardEvent("keydown", {
            key: "k",
            metaKey: true,
            bubbles: true,
        });
        document.dispatchEvent(event);
    }, []);

    const shrunkHeight = isScrolled && !reducedMotion ? 48 : undefined;

    return (
        <header
            ref={headerRef}
            className={cn(
                "sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 backdrop-blur-xl px-4 lg:px-6 transition-[height,border-color,box-shadow] duration-200 motion-reduce:transition-none",
                isScrolled ? "border-border shadow-sm" : "border-border/60"
            )}
            style={{ height: shrunkHeight ?? LAYOUT.topbar.height }}
            role="banner"
        >
            {/* Left: Mobile Menu + Breadcrumbs + Env Badge */}
            <div className="flex items-center gap-3 min-w-0">
                {isMobile && (
                    <button
                        id="sidebar-menu-toggle"
                        onClick={() => setOpen(true)}
                        className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground",
                            "hover:text-foreground hover:bg-secondary transition-colors lg:hidden shrink-0",
                            FOCUS_RING
                        )}
                        aria-label="Open navigation menu"
                        aria-controls="main-navigation"
                        aria-expanded={isOpen}
                    >
                        <Menu className={ICON_SIZES.md} />
                    </button>
                )}

                <EnvironmentBadge />

                {activeNavContext?.section.title && (
                    <Badge
                        variant="secondary"
                        className="hidden md:inline-flex h-5 px-1.5 text-[10px] font-medium"
                    >
                        {activeNavContext.section.title}
                    </Badge>
                )}

                {/* Desktop Breadcrumbs with overflow collapse */}
                <nav
                    className="hidden sm:flex items-center gap-1 text-sm min-w-0"
                    aria-label="Breadcrumb"
                >
                    <ol className="flex items-center gap-1 min-w-0">
                        {visibleCrumbs.map((crumb, i) => (
                            <li key={crumb.path + i} className="flex items-center gap-1 min-w-0">
                                {i > 0 && (
                                    <ChevronRight
                                        className="h-3 w-3 text-muted-foreground/40 shrink-0"
                                        aria-hidden="true"
                                    />
                                )}
                                {"isEllipsis" in crumb && crumb.isEllipsis ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className={cn(
                                                    "font-medium text-muted-foreground hover:text-foreground transition-colors px-1",
                                                    FOCUS_RING
                                                )}
                                                aria-label="Show collapsed breadcrumbs"
                                            >
                                                …
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            {breadcrumbs.slice(1, -1).map((hidden) => (
                                                <DropdownMenuItem
                                                    key={hidden.path}
                                                    onClick={() => router.push(hidden.path)}
                                                >
                                                    {hidden.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : crumb.isLast ? (
                                    <span
                                        className="font-semibold text-foreground truncate"
                                        aria-current="page"
                                    >
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.path}
                                        className={cn(
                                            "font-medium text-muted-foreground hover:text-foreground transition-colors truncate",
                                            FOCUS_RING
                                        )}
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
                className={cn(
                    "hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border",
                    "bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer",
                    FOCUS_RING
                )}
                aria-label="Search or type a command"
            >
                <Search className="h-3.5 w-3.5" />
                <span>Search or type a command...</span>
                <kbd className="flex items-center gap-0.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50">
                    <Command className="h-2.5 w-2.5" />K
                </kbd>
            </button>

            {/* Right: Actions — wrapped in nav landmark */}
            <nav className="flex items-center gap-1" aria-label="Global actions">
                {/* Mobile search trigger */}
                <TopbarIconButton
                    icon={Search}
                    label="Search"
                    shortcut="⌘K"
                    onClick={openCommandBar}
                    className="md:hidden"
                />

                {/* Connection status */}
                <ConnectionIndicator />

                {/* Quick create */}
                <div className="hidden sm:block">
                    <QuickCreateMenu userRole={userRole} />
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Messages */}
                <div className="hidden sm:block">
                    <MessagesMenu />
                </div>

                {/* Settings — visible on md+ */}
                <div className="hidden md:block">
                    <TopbarIconButton icon={Settings} label="Settings" href="/settings" />
                </div>

                {/* Help — visible on md+ */}
                <div className="hidden md:block">
                    <HelpMenu />
                </div>

                {/* Locale — visible on lg+ */}
                <div className="hidden lg:block">
                    <LocaleSwitcher />
                </div>

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Overflow menu for tablet/mobile (items hidden at smaller breakpoints) */}
                <OverflowMenu />

                {/* User avatar + menu — always visible */}
                <UserMenu />
            </nav>
        </header>
    );
}
