import { describe, expect, it } from "vitest";
import {
    computeNotificationPriority,
    groupNotificationsIntoDigest,
} from "@/lib/data-hooks/hooks-smart-notifications";
import type { ScoredNotification } from "@/lib/data-hooks/hooks-smart-notifications";

// ─── computeNotificationPriority ─────────────────────────────

describe("computeNotificationPriority", () => {
    const NOW = new Date("2026-03-25T12:00:00Z");

    it("returns correct base priority for known types", () => {
        const { priority } = computeNotificationPriority("sla_breach", NOW.toISOString(), NOW);
        expect(priority).toBe(100); // no decay for same-moment
    });

    it("returns default priority (30) for unknown types", () => {
        const { priority } = computeNotificationPriority("custom_unknown", NOW.toISOString(), NOW);
        expect(priority).toBe(30);
    });

    it("applies recency decay over time", () => {
        // 24 hours ago → ~50% decay
        const oneDayAgo = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const { priority } = computeNotificationPriority("sla_breach", oneDayAgo, NOW);
        expect(priority).toBeGreaterThan(40);
        expect(priority).toBeLessThanOrEqual(55);
    });

    it("returns higher priority for approval than info", () => {
        const { priority: approvalP } = computeNotificationPriority(
            "approval",
            NOW.toISOString(),
            NOW
        );
        const { priority: infoP } = computeNotificationPriority("info", NOW.toISOString(), NOW);
        expect(approvalP).toBeGreaterThan(infoP);
    });

    it("computes ageMinutes correctly", () => {
        const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString();
        const { ageMinutes } = computeNotificationPriority("info", twoHoursAgo, NOW);
        expect(ageMinutes).toBe(120);
    });

    it("returns 0 ageMinutes for future timestamps", () => {
        const futureTime = new Date(NOW.getTime() + 60000).toISOString();
        const { ageMinutes } = computeNotificationPriority("info", futureTime, NOW);
        expect(ageMinutes).toBe(0);
    });
});

// ─── groupNotificationsIntoDigest ────────────────────────────

describe("groupNotificationsIntoDigest", () => {
    const makeNotification = (
        id: string,
        entity_type: string,
        priority: number,
        created_at = "2026-03-25T12:00:00Z"
    ): ScoredNotification => ({
        id,
        type: "info",
        title: `Title ${id}`,
        body: `Body ${id}`,
        entity_type,
        entity_id: `eid-${id}`,
        read: false,
        created_at,
        priority,
        ageMinutes: 0,
    });

    it("groups notifications by entity_type", () => {
        const notifications = [
            makeNotification("1", "project", 50),
            makeNotification("2", "project", 40),
            makeNotification("3", "task", 80),
        ];
        const groups = groupNotificationsIntoDigest(notifications);
        expect(groups).toHaveLength(2);
        const projectGroup = groups.find((g) => g.entityType === "project");
        expect(projectGroup?.count).toBe(2);
    });

    it("sorts groups by highest priority", () => {
        const notifications = [
            makeNotification("1", "project", 30),
            makeNotification("2", "task", 80),
        ];
        const groups = groupNotificationsIntoDigest(notifications);
        expect(groups[0]!.entityType).toBe("task");
        expect(groups[1]!.entityType).toBe("project");
    });

    it("uses 'general' for notifications without entity_type", () => {
        const n: ScoredNotification = {
            id: "1",
            type: "info",
            title: "t",
            body: "b",
            read: false,
            created_at: "2026-03-25T12:00:00Z",
            priority: 50,
            ageMinutes: 0,
        };
        const groups = groupNotificationsIntoDigest([n]);
        expect(groups[0]!.entityType).toBe("general");
    });

    it("returns empty array for empty input", () => {
        expect(groupNotificationsIntoDigest([])).toEqual([]);
    });

    it("tracks latestAt correctly per group", () => {
        const notifications = [
            makeNotification("1", "project", 50, "2026-03-25T10:00:00Z"),
            makeNotification("2", "project", 40, "2026-03-25T14:00:00Z"),
        ];
        const groups = groupNotificationsIntoDigest(notifications);
        expect(groups[0]!.latestAt).toBe("2026-03-25T14:00:00Z");
    });
});
