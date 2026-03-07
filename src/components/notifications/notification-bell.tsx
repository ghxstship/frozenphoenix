"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
    isSupabaseConfigured,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
    useUnreadNotificationCount,
} from "@/lib/supabase/hooks-v2-features";

interface MockNotification {
    id: string;
    type: string;
    title: string;
    body: string;
    entity_type?: string;
    entity_id?: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
}

const PLACEHOLDER_NOTIFICATIONS: MockNotification[] = [
    {
        id: "n1",
        type: "mention",
        title: "@you in Project Discussion",
        body: "Sarah Chen mentioned you in the Nike Air Max Launch project",
        entity_type: "project",
        entity_id: "p-001",
        action_url: "/projects/p-001",
        is_read: false,
        created_at: "2026-03-01T12:30:00Z",
    },
    {
        id: "n2",
        type: "approval",
        title: "Budget Approval Required",
        body: "Red Bull Festival budget ($45,000) needs your approval",
        entity_type: "budget",
        entity_id: "b-012",
        action_url: "/approvals",
        is_read: false,
        created_at: "2026-03-01T11:15:00Z",
    },
    {
        id: "n3",
        type: "automation",
        title: "Automation: Task Created",
        body: "Follow-up task auto-created for overdue deliverable",
        entity_type: "task",
        entity_id: "t-200",
        action_url: "/tasks",
        is_read: false,
        created_at: "2026-03-01T09:00:00Z",
    },
    {
        id: "n4",
        type: "assignment",
        title: "New Task Assigned",
        body: "You've been assigned to 'Finalize venue layout' on Samsung Pop-Up",
        entity_type: "task",
        entity_id: "t-312",
        action_url: "/tasks",
        is_read: true,
        created_at: "2026-02-28T16:42:00Z",
    },
    {
        id: "n5",
        type: "sla_breach",
        title: "SLA Warning: Response Due",
        body: "Service request SR-0045 response SLA expires in 2 hours",
        entity_type: "service_request",
        entity_id: "sr-045",
        action_url: "/service-requests",
        is_read: false,
        created_at: "2026-02-28T14:00:00Z",
    },
    {
        id: "n6",
        type: "alert",
        title: "Budget Threshold Reached",
        body: "Adidas Festival project budget at 85% utilization",
        entity_type: "project",
        entity_id: "p-008",
        action_url: "/projects/p-008",
        is_read: true,
        created_at: "2026-02-28T10:20:00Z",
    },
    {
        id: "n7",
        type: "reminder",
        title: "Timesheet Reminder",
        body: "You have 3 unlogged days this week",
        action_url: "/time-tracking",
        is_read: false,
        created_at: "2026-02-27T17:00:00Z",
    },
];

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
    const [localNotifications, setLocalNotifications] = useState(PLACEHOLDER_NOTIFICATIONS);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { data: sbNotifications } = useNotifications();
    const { data: sbUnreadCount } = useUnreadNotificationCount();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const notifications: MockNotification[] =
        isSupabaseConfigured && sbNotifications
            ? (sbNotifications as unknown as MockNotification[])
            : localNotifications;

    const unreadCount = isSupabaseConfigured
        ? (sbUnreadCount ?? 0)
        : localNotifications.filter((n) => !n.is_read).length;

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
            if (isSupabaseConfigured) {
                markRead.mutate(id);
            } else {
                setLocalNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
                );
            }
        },
        [markRead]
    );

    const handleMarkAllRead = useCallback(() => {
        if (isSupabaseConfigured) {
            markAllRead.mutate();
        } else {
            setLocalNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
    }, [markAllRead]);

    const handleClick = useCallback(
        (notif: MockNotification) => {
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-7 w-7 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Bell className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-start gap-3 ${
                                            !notif.is_read ? "bg-accent/20" : ""
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
                                                    className={`text-sm truncate ${!notif.is_read ? "font-semibold" : ""}`}
                                                >
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
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
                                            {!notif.is_read && (
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
