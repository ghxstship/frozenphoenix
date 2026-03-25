import { describe, expect, it } from "vitest";
import { computeCriticalPath, computeDependencyPaths } from "@/lib/gantt-dependencies";
import type { GanttTask } from "@/components/ui/gantt-chart";
import type { TaskPosition } from "@/lib/gantt-dependencies";

// ─── computeCriticalPath ─────────────────────────────────────

describe("computeCriticalPath", () => {
    it("returns all tasks in a linear chain", () => {
        const tasks: GanttTask[] = [
            {
                id: "a",
                label: "A",
                startDate: "2026-01-01",
                endDate: "2026-01-03",
                dependencies: [],
            },
            {
                id: "b",
                label: "B",
                startDate: "2026-01-04",
                endDate: "2026-01-06",
                dependencies: ["a"],
            },
            {
                id: "c",
                label: "C",
                startDate: "2026-01-07",
                endDate: "2026-01-09",
                dependencies: ["b"],
            },
        ];
        const critical = computeCriticalPath(tasks);
        expect(critical.has("a")).toBe(true);
        expect(critical.has("b")).toBe(true);
        expect(critical.has("c")).toBe(true);
    });

    it("identifies the longer branch as critical in a fork", () => {
        const tasks: GanttTask[] = [
            {
                id: "start",
                label: "Start",
                startDate: "2026-01-01",
                endDate: "2026-01-02",
                dependencies: [],
            },
            // Short branch
            {
                id: "short",
                label: "Short",
                startDate: "2026-01-03",
                endDate: "2026-01-04",
                dependencies: ["start"],
            },
            // Long branch
            {
                id: "long1",
                label: "Long1",
                startDate: "2026-01-03",
                endDate: "2026-01-06",
                dependencies: ["start"],
            },
            {
                id: "long2",
                label: "Long2",
                startDate: "2026-01-07",
                endDate: "2026-01-10",
                dependencies: ["long1"],
            },
            // Join
            {
                id: "end",
                label: "End",
                startDate: "2026-01-11",
                endDate: "2026-01-12",
                dependencies: ["short", "long2"],
            },
        ];
        const critical = computeCriticalPath(tasks);
        expect(critical.has("start")).toBe(true);
        expect(critical.has("long1")).toBe(true);
        expect(critical.has("long2")).toBe(true);
        expect(critical.has("end")).toBe(true);
        // Short branch has float, so it should NOT be critical
        expect(critical.has("short")).toBe(false);
    });

    it("returns empty set for empty tasks", () => {
        expect(computeCriticalPath([])).toEqual(new Set());
    });

    it("handles single task", () => {
        const tasks: GanttTask[] = [
            { id: "only", label: "Only", startDate: "2026-01-01", endDate: "2026-01-05" },
        ];
        const critical = computeCriticalPath(tasks);
        expect(critical.has("only")).toBe(true);
        expect(critical.size).toBe(1);
    });
});

// ─── computeDependencyPaths ──────────────────────────────────

describe("computeDependencyPaths", () => {
    it("generates paths for connected tasks", () => {
        const tasks: GanttTask[] = [
            { id: "a", label: "A", startDate: "2026-01-01", endDate: "2026-01-03" },
            {
                id: "b",
                label: "B",
                startDate: "2026-01-04",
                endDate: "2026-01-06",
                dependencies: ["a"],
            },
        ];
        const positions: TaskPosition[] = [
            { id: "a", startX: 0, endX: 100, y: 30 },
            { id: "b", startX: 110, endX: 210, y: 70 },
        ];
        const paths = computeDependencyPaths(tasks, positions, new Set(["a", "b"]));
        expect(paths).toHaveLength(1);
        expect(paths[0]!.from).toBe("a");
        expect(paths[0]!.to).toBe("b");
        expect(paths[0]!.pathData).toContain("M 100 30");
        expect(paths[0]!.isCritical).toBe(true);
    });

    it("returns empty paths when no dependencies", () => {
        const tasks: GanttTask[] = [
            { id: "a", label: "A", startDate: "2026-01-01", endDate: "2026-01-03" },
            { id: "b", label: "B", startDate: "2026-01-04", endDate: "2026-01-06" },
        ];
        const positions: TaskPosition[] = [
            { id: "a", startX: 0, endX: 100, y: 30 },
            { id: "b", startX: 110, endX: 210, y: 70 },
        ];
        const paths = computeDependencyPaths(tasks, positions, new Set());
        expect(paths).toHaveLength(0);
    });

    it("marks non-critical paths correctly", () => {
        const tasks: GanttTask[] = [
            { id: "a", label: "A", startDate: "2026-01-01", endDate: "2026-01-03" },
            {
                id: "b",
                label: "B",
                startDate: "2026-01-04",
                endDate: "2026-01-06",
                dependencies: ["a"],
            },
        ];
        const positions: TaskPosition[] = [
            { id: "a", startX: 0, endX: 100, y: 30 },
            { id: "b", startX: 110, endX: 210, y: 70 },
        ];
        // Only 'a' is critical, 'b' is not
        const paths = computeDependencyPaths(tasks, positions, new Set(["a"]));
        expect(paths[0]!.isCritical).toBe(false);
    });

    it("skips paths when positions are missing", () => {
        const tasks: GanttTask[] = [
            { id: "a", label: "A", startDate: "2026-01-01", endDate: "2026-01-03" },
            {
                id: "b",
                label: "B",
                startDate: "2026-01-04",
                endDate: "2026-01-06",
                dependencies: ["a"],
            },
        ];
        const positions: TaskPosition[] = [{ id: "b", startX: 110, endX: 210, y: 70 }];
        const paths = computeDependencyPaths(tasks, positions, new Set());
        expect(paths).toHaveLength(0); // 'a' position missing
    });
});
