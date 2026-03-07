"use client";

import { cn } from "@/lib/utils";
import { useAdvanceStatusHistory } from "@/lib/supabase/hooks-advancing";
import { ADVANCE_ITEM_STATUS_MAP, ADVANCE_STATUS_MAP } from "@/config/advancing-config";

interface AdvanceTimelineProps {
    entityType: "advance" | "advance_item";
    entityId: string;
    className?: string;
}

export function AdvanceTimeline({ entityType, entityId, className }: AdvanceTimelineProps) {
    const { data: history, isLoading } = useAdvanceStatusHistory(entityType, entityId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">
                No status history yet
            </p>
        );
    }

    const statusMap = entityType === "advance" ? ADVANCE_STATUS_MAP : ADVANCE_ITEM_STATUS_MAP;

    return (
        <div className={cn("flex flex-col", className)}>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">Status History</h4>
            <ol className="relative border-l border-border pl-6" aria-label="Status history timeline">
                {(history as Record<string, unknown>[]).map((entry, index) => {
                    const toStatus = entry.to_status as string;
                    const fromStatus = entry.from_status as string | null;
                    const reason = entry.reason as string | null;
                    const createdAt = entry.created_at as string;
                    const toConfig = (statusMap as Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }>)[toStatus];
                    const Icon = toConfig?.icon;

                    return (
                        <li key={entry.id as string} className="relative mb-6 last:mb-0">
                            {/* Dot */}
                            <div
                                className={cn(
                                    "absolute -left-[calc(1.5rem+0.375rem)] flex h-3 w-3 items-center justify-center rounded-full border-2 border-background",
                                    index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                                )}
                            />
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                                    <span className="text-sm font-medium">
                                        {toConfig?.label ?? toStatus}
                                    </span>
                                </div>
                                {fromStatus && (
                                    <span className="text-xs text-muted-foreground">
                                        from {(statusMap as Record<string, { label: string }>)[fromStatus]?.label ?? fromStatus}
                                    </span>
                                )}
                                {reason && (
                                    <p className="mt-0.5 text-xs text-muted-foreground italic">
                                        &ldquo;{reason}&rdquo;
                                    </p>
                                )}
                                <time
                                    dateTime={createdAt}
                                    className="text-[11px] text-muted-foreground/60"
                                >
                                    {new Date(createdAt).toLocaleString()}
                                </time>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
