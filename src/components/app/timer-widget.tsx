"use client";

/**
 * Gap #10: Global Timer Widget (start/stop in topbar)
 *
 * Persistent time tracking widget that lives in the topbar.
 * Users can start/stop a timer, select a project/task, and the
 * elapsed time persists across page navigation via localStorage.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, Timer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimerState {
    running: boolean;
    startedAt: number | null; // epoch ms
    elapsed: number; // accumulated ms before current run
    projectId: string | null;
    projectName: string | null;
    taskId: string | null;
    taskName: string | null;
    notes: string;
}

const STORAGE_KEY = "pb-timer-state";

function loadTimerState(): TimerState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        /* ignore */
    }
    return {
        running: false,
        startedAt: null,
        elapsed: 0,
        projectId: null,
        projectName: null,
        taskId: null,
        taskName: null,
        notes: "",
    };
}

function saveTimerState(state: TimerState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* ignore */
    }
}

function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TimerWidget() {
    const [state, setState] = useState<TimerState>(loadTimerState);
    const [displayTime, setDisplayTime] = useState("00:00:00");
    const [open, setOpen] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Update display time every second
    useEffect(() => {
        if (state.running && state.startedAt) {
            const tick = () => {
                const now = Date.now();
                const total = state.elapsed + (now - state.startedAt!);
                setDisplayTime(formatElapsed(total));
            };
            tick();
            intervalRef.current = setInterval(tick, 1000);
            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        } else {
            setDisplayTime(formatElapsed(state.elapsed));
        }
    }, [state.running, state.startedAt, state.elapsed]);

    // Persist state changes
    useEffect(() => {
        saveTimerState(state);
    }, [state]);

    const handleStart = useCallback(() => {
        setState((prev) => ({
            ...prev,
            running: true,
            startedAt: Date.now(),
        }));
    }, []);

    const handlePause = useCallback(() => {
        setState((prev) => {
            const now = Date.now();
            const additionalMs = prev.startedAt ? now - prev.startedAt : 0;
            return {
                ...prev,
                running: false,
                startedAt: null,
                elapsed: prev.elapsed + additionalMs,
            };
        });
    }, []);

    const handleStop = useCallback(async () => {
        const now = Date.now();
        const finalElapsed = state.elapsed + (state.startedAt ? now - state.startedAt : 0);
        const hours = Math.round((finalElapsed / 3600000) * 100) / 100;

        if (hours > 0) {
            try {
                const { getCsrfToken, CSRF_HEADER_NAME } = await import("@/lib/security/csrf");
                const csrfToken = getCsrfToken();
                await fetch("/api/time-entries", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        hours_worked: hours,
                        hourly_rate: 0,
                        date: new Date().toISOString().split("T")[0],
                        notes: state.notes || `Timer: ${formatElapsed(finalElapsed)}`,
                        project_id: state.projectId,
                        task_id: state.taskId,
                        status: "draft",
                    }),
                });
            } catch {
                // Silently fail — user can manually create the entry
            }
        }

        setState({
            running: false,
            startedAt: null,
            elapsed: 0,
            projectId: null,
            projectName: null,
            taskId: null,
            taskName: null,
            notes: "",
        });
        setOpen(false);
    }, [state]);

    const isActive = state.running || state.elapsed > 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn("gap-1.5 font-mono text-xs", state.running && "animate-pulse")}
                    aria-label={isActive ? `Timer: ${displayTime}` : "Start timer"}
                >
                    <Timer className="h-3.5 w-3.5" />
                    {isActive ? displayTime : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
                <div className="space-y-3">
                    <div className="text-center">
                        <p className="text-2xl font-mono font-bold tabular-nums">{displayTime}</p>
                        {state.projectName && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {state.projectName}
                                {state.taskName && ` · ${state.taskName}`}
                            </p>
                        )}
                    </div>

                    <textarea
                        className="w-full h-16 rounded-md border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="What are you working on?"
                        value={state.notes}
                        onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
                    />

                    <div className="flex items-center justify-center gap-2">
                        {!state.running ? (
                            <Button size="sm" onClick={handleStart} className="gap-1.5">
                                <Play className="h-3.5 w-3.5" />
                                {state.elapsed > 0 ? "Resume" : "Start"}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handlePause}
                                className="gap-1.5"
                            >
                                <Pause className="h-3.5 w-3.5" />
                                Pause
                            </Button>
                        )}
                        {isActive && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleStop}
                                className="gap-1.5"
                            >
                                <Square className="h-3.5 w-3.5" />
                                Save
                            </Button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
