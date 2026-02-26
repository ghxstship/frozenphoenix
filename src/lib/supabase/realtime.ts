"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = 
    | "projects" | "tasks" | "deals" | "approvals" 
    | "notifications" | "comments" | "activity_log"
    | "budgets" | "contracts" | "invoices" | "client_invoices"
    | "workflow_instances" | "workflow_step_approvals"
    | "crew_shifts" | "incidents" | "shipments"
    | "proposals" | "scopes_of_work" | "e_signatures"
    | "assets" | "purchase_orders" | "expenses";

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

// ─── Deals Pipeline Realtime ───
export function useDealsRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel("deals_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "deals" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["deals"] });
                    queryClient.invalidateQueries({ queryKey: ["pipeline_summary"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);
}

// ─── Approvals Realtime ───
export function useApprovalsRealtime(userId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const filter = userId ? `approver_id=eq.${userId}` : undefined;

        const channel = supabase
            .channel("approvals_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "approvals", filter },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["approvals"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, queryClient]);
}

// ─── Budgets Realtime ───
export function useBudgetsRealtime(projectId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const filter = projectId ? `project_id=eq.${projectId}` : undefined;

        const channel = supabase
            .channel("budgets_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "budgets", filter },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["budgets"] });
                    queryClient.invalidateQueries({ queryKey: ["budget_line_items"] });
                    if (projectId) {
                        queryClient.invalidateQueries({ queryKey: ["project_profitability"] });
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId, queryClient]);
}

// ─── Contracts Realtime ───
export function useContractsRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel("contracts_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "contracts" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["contracts"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);
}

// ─── Invoices Realtime (both vendor invoices and client invoices) ───
export function useInvoicesRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const vendorChannel = supabase
            .channel("invoices_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "invoices" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["invoices"] });
                    queryClient.invalidateQueries({ queryKey: ["invoice_aging"] });
                }
            )
            .subscribe();

        const clientChannel = supabase
            .channel("client_invoices_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "client_invoices" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["client_invoices"] });
                    queryClient.invalidateQueries({ queryKey: ["v_client_invoice_aging"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(vendorChannel);
            supabase.removeChannel(clientChannel);
        };
    }, [queryClient]);
}

// ─── Workflow Instances Realtime ───
export function useWorkflowRealtime(workflowId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const instanceFilter = workflowId
            ? `workflow_id=eq.${workflowId}`
            : undefined;

        const instanceChannel = supabase
            .channel("workflow_instances_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "workflow_instances", filter: instanceFilter },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
                }
            )
            .subscribe();

        const stepChannel = supabase
            .channel("workflow_step_approvals_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "workflow_step_approvals" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["workflow_step_approvals"] });
                    queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(instanceChannel);
            supabase.removeChannel(stepChannel);
        };
    }, [workflowId, queryClient]);
}

// ─── E-Signatures Realtime ───
export function useESignaturesRealtime(documentId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const filter = documentId ? `document_id=eq.${documentId}` : undefined;

        const channel = supabase
            .channel("e_signatures_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "e_signatures", filter },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["e_signatures"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [documentId, queryClient]);
}

// ─── Crew Shifts Realtime ───
export function useCrewShiftsRealtime(projectId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const filter = projectId ? `project_id=eq.${projectId}` : undefined;

        const channel = supabase
            .channel("crew_shifts_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "crew_shifts", filter },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["crew_shifts"] });
                    queryClient.invalidateQueries({ queryKey: ["crew_utilization"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId, queryClient]);
}

// ─── Incidents Realtime ───
export function useIncidentsRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel("incidents_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "incidents" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["incidents"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);
}

// ─── Composite: Full Project Realtime (project + tasks + budgets + milestones) ───
export function useFullProjectRealtime(projectId: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !projectId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channels: RealtimeChannel[] = [];
        const tables = ["projects", "tasks", "budgets", "budget_line_items", "milestones", "expenses"] as const;

        tables.forEach((table) => {
            const filterKey = table === "projects" ? "id" : "project_id";
            const ch = supabase
                .channel(`full_project_${projectId}_${table}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table,
                        filter: `${filterKey}=eq.${projectId}`,
                    },
                    () => {
                        queryClient.invalidateQueries({ queryKey: [table] });
                        queryClient.invalidateQueries({ queryKey: [table, projectId] });
                    }
                )
                .subscribe();
            channels.push(ch);
        });

        return () => {
            channels.forEach((ch) => supabase.removeChannel(ch));
        };
    }, [projectId, queryClient]);
}
