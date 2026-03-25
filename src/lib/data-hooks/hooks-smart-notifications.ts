"use client";

/* ═══════════════════════════════════════════════════════════════
   SMART NOTIFICATIONS — AI-Prioritized Feed + Digest Mode

   Wraps the existing notification hooks with:
   1. Priority scoring per notification type × recency
   2. Digest grouping (batch by entity type)
   3. Smart sorting (highest priority first)
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from "react";
import { useNotifications } from "@/lib/data-hooks/hooks-automation";

// ─── Priority Scoring ────────────────────────────────────────

const TYPE_PRIORITY: Record<string, number> = {
    sla_breach: 100,
    alert: 90,
    approval: 80,
    assignment: 70,
    mention: 60,
    automation: 50,
    reminder: 40,
    info: 30,
};

interface NotificationRecord {
    id: string;
    type: string;
    title: string;
    body: string;
    entity_type?: string | undefined;
    entity_id?: string | undefined;
    action_url?: string | undefined;
    read: boolean;
    created_at: string;
}

export interface ScoredNotification extends NotificationRecord {
    priority: number;
    ageMinutes: number;
}

export interface NotificationDigestGroup {
    entityType: string;
    count: number;
    highestPriority: number;
    notifications: ScoredNotification[];
    latestAt: string;
}

/**
 * Compute priority score for a notification.
 * Score = base type priority × recency decay.
 * Exported for unit testing.
 */
export function computeNotificationPriority(
    type: string,
    createdAt: string,
    now?: Date | undefined
): { priority: number; ageMinutes: number } {
    const base = TYPE_PRIORITY[type] ?? 30;
    const currentTime = now ?? new Date();
    const ageMs = currentTime.getTime() - new Date(createdAt).getTime();
    const ageMinutes = Math.max(0, Math.floor(ageMs / 60000));

    // Recency decay: halves every 24 hours
    const decayFactor = Math.pow(0.5, ageMinutes / 1440);
    const priority = Math.round(base * decayFactor);

    return { priority, ageMinutes };
}

/**
 * Group notifications by entity type for digest view.
 * Exported for unit testing.
 */
export function groupNotificationsIntoDigest(
    notifications: ScoredNotification[]
): NotificationDigestGroup[] {
    const groups: Record<string, NotificationDigestGroup> = {};

    for (const n of notifications) {
        const key = n.entity_type ?? "general";
        if (!groups[key]) {
            groups[key] = {
                entityType: key,
                count: 0,
                highestPriority: 0,
                notifications: [],
                latestAt: n.created_at,
            };
        }
        const group = groups[key]!;
        group.count++;
        group.notifications.push(n);
        if (n.priority > group.highestPriority) {
            group.highestPriority = n.priority;
        }
        if (n.created_at > group.latestAt) {
            group.latestAt = n.created_at;
        }
    }

    return Object.values(groups).sort((a, b) => b.highestPriority - a.highestPriority);
}

// ─── Hooks ───────────────────────────────────────────────────

/**
 * Returns all notifications with computed priority scores, sorted by priority.
 */
export function useSmartNotifications() {
    const { data: rawNotifications, isLoading } = useNotifications();

    const scored = useMemo(() => {
        if (!rawNotifications) return [];
        const now = new Date();

        return (rawNotifications as unknown as NotificationRecord[])
            .map((n) => {
                const { priority, ageMinutes } = computeNotificationPriority(
                    n.type,
                    n.created_at,
                    now
                );
                return { ...n, priority, ageMinutes } as ScoredNotification;
            })
            .sort((a, b) => b.priority - a.priority);
    }, [rawNotifications]);

    return { notifications: scored, isLoading };
}

/**
 * Returns notifications grouped into digest entries by entity type.
 */
export function useNotificationDigest() {
    const { notifications, isLoading } = useSmartNotifications();

    const digest = useMemo(() => groupNotificationsIntoDigest(notifications), [notifications]);

    return { digest, isLoading };
}
