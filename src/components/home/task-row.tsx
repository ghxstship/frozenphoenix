"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP } from "@/config/domain-config";
import type { TaskPriority, TaskStatus } from "@/types";

export interface TaskRowItem {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string | null | undefined;
    projectName?: string | null | undefined;
}

function formatDueLabel(dueDate: string): { label: string; overdue: boolean } {
    const now = new Date();
    const due = new Date(dueDate + "T00:00:00");
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true };
    if (diffDays === 0) return { label: "Due today", overdue: false };
    if (diffDays === 1) return { label: "Due tomorrow", overdue: false };
    if (diffDays <= 7) return { label: `Due in ${diffDays}d`, overdue: false };
    return {
        label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        overdue: false,
    };
}

export function TaskRow({ task }: { task: TaskRowItem }) {
    const statusCfg = TASK_STATUS_MAP[task.status];
    const priorityCfg = TASK_PRIORITY_MAP[task.priority];
    const due = task.dueDate ? formatDueLabel(task.dueDate) : null;

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/40 transition-colors group"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {task.title}
                </p>
                {task.projectName && (
                    <p className="density-caption text-muted-foreground truncate">
                        {task.projectName}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={statusCfg?.variant ?? "ghost"} className="density-caption">
                    {statusCfg?.label ?? task.status}
                </Badge>
                <Badge variant={priorityCfg?.variant ?? "ghost"} className="density-caption">
                    {priorityCfg?.label ?? task.priority}
                </Badge>
                {due && (
                    <span
                        className={`density-caption tabular-nums ${
                            due.overdue ? "text-destructive font-semibold" : "text-muted-foreground"
                        }`}
                    >
                        {due.label}
                    </span>
                )}
            </div>
        </Link>
    );
}
