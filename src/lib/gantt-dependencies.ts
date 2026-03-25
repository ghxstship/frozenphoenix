"use client";

/* ═══════════════════════════════════════════════════════════════
   GANTT DEPENDENCY UTILITIES — SVG Path Computation & Critical Path

   Pure functions for computing dependency arrow SVG paths and
   critical path analysis. Used by GanttChart component.
   ═══════════════════════════════════════════════════════════════ */

import type { GanttTask } from "@/components/ui/gantt-chart";

// ─── Types ───────────────────────────────────────────────────

export interface DependencyPath {
    from: string;
    to: string;
    pathData: string;
    isCritical: boolean;
}

export interface TaskPosition {
    id: string;
    startX: number;
    endX: number;
    y: number;
}

// ─── SVG Path Computation ────────────────────────────────────

/**
 * Compute SVG path data for dependency arrows between tasks.
 * Returns curved Bezier arrows from predecessor end to successor start.
 * Exported for testing.
 */
export function computeDependencyPaths(
    tasks: GanttTask[],
    positions: TaskPosition[],
    criticalSet: Set<string>
): DependencyPath[] {
    const paths: DependencyPath[] = [];
    const posMap = new Map(positions.map((p) => [p.id, p]));

    for (const task of tasks) {
        if (!task.dependencies || task.dependencies.length === 0) continue;

        const toPos = posMap.get(task.id);
        if (!toPos) continue;

        for (const depId of task.dependencies) {
            const fromPos = posMap.get(depId);
            if (!fromPos) continue;

            // Curved bezier from end of predecessor to start of successor
            const startX = fromPos.endX;
            const startY = fromPos.y;
            const endX = toPos.startX;
            const endY = toPos.y;

            const _midX = (sourceX + targetX) / 2;
            const controlOffset = Math.abs(endY - startY) * 0.3 + 20;

            const pathData =
                `M ${startX} ${startY} ` +
                `C ${startX + controlOffset} ${startY}, ` +
                `${endX - controlOffset} ${endY}, ` +
                `${endX} ${endY}`;

            const isCritical = criticalSet.has(task.id) && criticalSet.has(depId);

            paths.push({ from: depId, to: task.id, pathData, isCritical });
        }
    }

    return paths;
}

// ─── Critical Path ───────────────────────────────────────────

function daysBetween(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Compute the critical path (longest path) through a dependency graph.
 * Returns the set of task IDs on the critical path.
 * Uses forward-pass / backward-pass algorithm.
 * Exported for testing.
 */
export function computeCriticalPath(tasks: GanttTask[]): Set<string> {
    if (tasks.length === 0) return new Set();

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const duration = new Map<string, number>();
    const es = new Map<string, number>(); // earliest start
    const ef = new Map<string, number>(); // earliest finish
    const ls = new Map<string, number>(); // latest start
    const lf = new Map<string, number>(); // latest finish

    // Compute durations
    for (const t of tasks) {
        duration.set(t.id, Math.max(1, daysBetween(t.startDate, t.endDate)));
    }

    // Forward pass — compute earliest start/finish
    const visited = new Set<string>();
    function forwardPass(id: string): number {
        if (ef.has(id)) return ef.get(id)!;
        const task = taskMap.get(id);
        if (!task) return 0;

        let maxPredFinish = 0;
        if (task.dependencies) {
            for (const depId of task.dependencies) {
                if (!visited.has(depId)) {
                    visited.add(depId);
                    forwardPass(depId);
                }
                maxPredFinish = Math.max(maxPredFinish, ef.get(depId) ?? 0);
            }
        }

        es.set(id, maxPredFinish);
        ef.set(id, maxPredFinish + (duration.get(id) ?? 1));
        return ef.get(id)!;
    }

    for (const t of tasks) {
        if (!visited.has(t.id)) {
            visited.add(t.id);
            forwardPass(t.id);
        }
    }

    // Find project end (max ef)
    let projectEnd = 0;
    for (const val of ef.values()) {
        projectEnd = Math.max(projectEnd, val);
    }

    // Build successors map for backward pass
    const successors = new Map<string, string[]>();
    for (const t of tasks) {
        if (t.dependencies) {
            for (const depId of t.dependencies) {
                if (!successors.has(depId)) successors.set(depId, []);
                successors.get(depId)!.push(t.id);
            }
        }
    }

    // Backward pass — compute latest start/finish
    const backVisited = new Set<string>();
    function backwardPass(id: string): void {
        if (lf.has(id)) return;
        const succs = successors.get(id);
        if (!succs || succs.length === 0) {
            lf.set(id, projectEnd);
        } else {
            let minSuccStart = Infinity;
            for (const succId of succs) {
                if (!backVisited.has(succId)) {
                    backVisited.add(succId);
                    backwardPass(succId);
                }
                minSuccStart = Math.min(minSuccStart, ls.get(succId) ?? projectEnd);
            }
            lf.set(id, minSuccStart);
        }
        ls.set(id, (lf.get(id) ?? projectEnd) - (duration.get(id) ?? 1));
    }

    for (const t of tasks) {
        if (!backVisited.has(t.id)) {
            backVisited.add(t.id);
            backwardPass(t.id);
        }
    }

    // Critical tasks have zero float (ES === LS)
    const critical = new Set<string>();
    for (const t of tasks) {
        const earlyStart = es.get(t.id) ?? 0;
        const lateStart = ls.get(t.id) ?? 0;
        if (Math.abs(earlyStart - lateStart) < 0.01) {
            critical.add(t.id);
        }
    }

    return critical;
}
