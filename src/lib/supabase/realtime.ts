"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = 
    | "projects" | "tasks" | "deals" | "approvals" 
    | "notifications" | "comments" | "activity_log";

interface UseRealtimeOptions {
    table: TableName;
    filter?: string;
    onInsert?: (payload: Record<string, unknown>) => void;
    onUpdate?: (payload: Record<string, unknown>) => void;
    onDelete?: (payload: Record<string, unknown>) => void;
}

export function useRealtimeSubscription({
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
}: UseRealtimeOptions) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        let channel: RealtimeChannel;

        const setupSubscription = () => {
            channel = supabase
                .channel(`${table}_changes`)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table,
                        filter,
                    },
                    (payload) => {
                        const { eventType, new: newRecord, old: oldRecord } = payload;

                        switch (eventType) {
                            case "INSERT":
                                onInsert?.(newRecord as Record<string, unknown>);
                                queryClient.invalidateQueries({ queryKey: [table] });
                                break;
                            case "UPDATE":
                                onUpdate?.(newRecord as Record<string, unknown>);
                                queryClient.invalidateQueries({ queryKey: [table] });
                                break;
                            case "DELETE":
                                onDelete?.(oldRecord as Record<string, unknown>);
                                queryClient.invalidateQueries({ queryKey: [table] });
                                break;
                        }
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [table, filter, onInsert, onUpdate, onDelete, queryClient]);
}

export function useNotificationsRealtime(userId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !userId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel("notifications_realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);
}

export function useActivityRealtime(entityType?: string, entityId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        let filter: string | undefined;
        if (entityType && entityId) {
            filter = `entity_type=eq.${entityType},entity_id=eq.${entityId}`;
        }

        const channel = supabase
            .channel("activity_realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "activity_log",
                    filter,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["activity_log", entityType, entityId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [entityType, entityId, queryClient]);
}

export function useCommentsRealtime(entityType: string, entityId: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !entityType || !entityId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel(`comments_${entityType}_${entityId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "comments",
                    filter: `entity_type=eq.${entityType},entity_id=eq.${entityId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["comments", entityType, entityId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [entityType, entityId, queryClient]);
}

// ─── X2: Cross-Domain Event Propagation ───
// Subscribe to domain_events table for cross-domain state change notifications
export function useDomainEventSubscription(
    sourceDomain?: string,
    onEvent?: (event: { event_type: string; entity_type: string; entity_id: string; payload: Record<string, unknown> }) => void
) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const filter = sourceDomain
            ? `source_domain=eq.${sourceDomain}`
            : undefined;

        const channel = supabase
            .channel("domain_events_propagation")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "domain_events",
                    filter,
                },
                (payload) => {
                    const record = payload.new as Record<string, unknown>;
                    onEvent?.({
                        event_type: record.event_type as string,
                        entity_type: record.entity_type as string,
                        entity_id: record.entity_id as string,
                        payload: (record.payload as Record<string, unknown>) ?? {},
                    });
                    // Auto-invalidate queries for the affected entity type
                    if (record.entity_type) {
                        queryClient.invalidateQueries({ queryKey: [record.entity_type as string] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sourceDomain, onEvent, queryClient]);
}

export function useProjectRealtime(projectId: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !projectId) return;

        const supabase = createClient();
        if (!supabase) return;

        const projectChannel = supabase
            .channel(`project_${projectId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "projects",
                    filter: `id=eq.${projectId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
                }
            )
            .subscribe();

        const tasksChannel = supabase
            .channel(`project_${projectId}_tasks`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `project_id=eq.${projectId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(tasksChannel);
        };
    }, [projectId, queryClient]);
}
