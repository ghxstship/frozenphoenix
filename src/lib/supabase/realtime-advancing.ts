"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════
// ADVANCING REALTIME SUBSCRIPTIONS
// Invalidates React Query caches on server-side changes.
// ═══════════════════════════════════════════════════════════════

export function useAdvancesRealtime(organizationId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !organizationId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel: RealtimeChannel = supabase
            .channel(`advances_${organizationId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "production_advances",
                    filter: `organization_id=eq.${organizationId}`,
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["production_advances"] });
                    const id = (payload.new as Record<string, unknown>)?.id ??
                        (payload.old as Record<string, unknown>)?.id;
                    if (id) {
                        queryClient.invalidateQueries({ queryKey: ["production_advances", id] });
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "production_advance_items",
                },
                (payload) => {
                    const advanceId = (payload.new as Record<string, unknown>)?.advance_id ??
                        (payload.old as Record<string, unknown>)?.advance_id;
                    if (advanceId) {
                        queryClient.invalidateQueries({ queryKey: ["production_advance_items", advanceId] });
                        queryClient.invalidateQueries({ queryKey: ["production_advances", advanceId] });
                    }
                    queryClient.invalidateQueries({ queryKey: ["production_advances"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organizationId, queryClient]);
}

export function useAdvanceStatusHistoryRealtime(entityId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured || !entityId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel: RealtimeChannel = supabase
            .channel(`advance_history_${entityId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "advance_status_history",
                    filter: `entity_id=eq.${entityId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["advance_status_history"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [entityId, queryClient]);
}

export function useCatalogRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel: RealtimeChannel = supabase
            .channel("catalog_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "catalog_items",
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
                    queryClient.invalidateQueries({ queryKey: ["catalog_categories"] });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "catalog_org_overrides",
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["catalog_org_overrides"] });
                    queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
