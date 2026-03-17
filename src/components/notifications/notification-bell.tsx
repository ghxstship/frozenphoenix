"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check, CheckCheck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useRouter } from "next/navigation";
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
    useUnreadNotificationCount,
} from "@/lib/supabase";
import { useNotificationsRealtime } from "@/lib/supabase/realtime";
import { useAuth } from "@/lib/supabase/auth-context";

type NotificationFilter = "unread" | "all";

const FILTER_OPTIONS: { value: NotificationFilter; label: string }[] = [
    { value: "unread", label: "Unread" },
    { value: "all", label: "All" },
];

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    body: string;
    entity_type?: string;
    entity_id?: string;
    action_url?: string;
    read: boolean;
    created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
    mention: "bg-info/10 text-info",
    approval: "bg-warning/10 text-warning",
    automation: "bg-primary/10 text-primary",
    assignment: "bg-success/10 text-success",
    sla_breach: "bg-destructive/10 text-destructive",
    alert: "bg-warning/10 text-warning",
    reminder: "bg-muted text-muted-foreground",
    info: "bg-muted text-muted-foreground",
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<NotificationFilter>("unread");
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user } = useAuth();

    useNotificationsRealtime(user?.id);

    const { data: sbUnreadNotifications } = useNotifications(true);
    const { data: sbAllNotifications } = useNotifications();
    const { data: sbUnreadCount } = useUnreadNotificationCount();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const unreadNotifications: NotificationItem[] =
        (sbUnreadNotifications as unknown as NotificationItem[]) ?? [];
    const allNotifications: NotificationItem[] =
        (sbAllNotifications as unknown as NotificationItem[]) ?? [];

    const notifications = filter === "unread" ? unreadNotifications : allNotifications;
    const unreadCount = sbUnreadCount ?? 0;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        if (isOpen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleMarkRead = useCallback(
        (id: string) => {
            markRead.mutate(id);
        },
        [markRead]
    );

    const handleMarkAllRead = useCallback(() => {
        markAllRead.mutate();
    }, [markAllRead]);

    const handleClick = useCallback(
        (notif: NotificationItem) => {
            handleMarkRead(notif.id);
            if (notif.action_url) {
                router.push(notif.action_url);
                setIsOpen(false);
            }
        },
        [handleMarkRead, router]
    );

    return (
        <div className="relative" ref={panelRef}>
            <Tooltip
                content={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                side="bottom"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </Tooltip>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-96 max-h-[480px] overflow-hidden rounded-xl border bg-popover shadow-lg z-50 animate-fade-in"
                    role="dialog"
                    aria-label="Notifications"
                >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    className="text-xs h-7"
                                >
                                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            <Tooltip content="Close" side="bottom">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-7 w-7 p-0"
                                    aria-label="Close notifications"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="border-b px-4 py-2">
                        <SegmentedControl
                            options={FILTER_OPTIONS}
                            value={filter}
                            onValueChange={setFilter}
                            ariaLabel="Filter notifications"
                            size="sm"
                            className="w-full"
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                {filter === "unread" ? (
                                    <>
                                        <CheckCheck className="h-8 w-8 mb-2 text-success opacity-70" />
                                        <p className="text-sm font-medium text-foreground">
                                            You&apos;re all caught up
                                        </p>
                                        <p className="text-xs mt-1">No unread notifications</p>
                                        {allNotifications.length > 0 && (
                                            <button
                                                className="text-xs text-primary hover:underline mt-3"
                                                onClick={() => setFilter("all")}
                                            >
                                                View past notifications
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <BellOff className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No notifications yet</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-start gap-3 ${
                                            !notif.read
                                                ? "bg-accent/20"
                                                : filter === "all"
                                                  ? "opacity-60"
                                                  : ""
                                        }`}
                                        onClick={() => handleClick(notif)}
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLORS[notif.type] || TYPE_COLORS.info}`}
                                        >
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={`text-sm truncate ${!notif.read ? "font-semibold" : ""}`}
                                                >
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {notif.body}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="ghost" className="text-[10px] h-4">
                                                    {notif.type}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {timeAgo(notif.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex gap-1 mt-1">
                                            {!notif.read && (
                                                <Tooltip content="Mark as read" side="left">
                                                    <button
                                                        className="p-1 rounded hover:bg-accent"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkRead(notif.id);
                                                        }}
                                                        aria-label="Mark as read"
                                                    >
                                                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {notif.action_url && (
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
