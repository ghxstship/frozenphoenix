"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./client";
import type { Tables, TablesUpdate } from "./database.types";

// ═══════════════════════════════════════════════════════════════
// Live-Ops Hooks — Supabase queries for all live-ops tables
// ═══════════════════════════════════════════════════════════════

export function useLiveEventInstances(eventId?: string) {
    return useQuery({
        queryKey: ["live_event_instances", eventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("live_event_instances").select("*");
            if (eventId) q = q.eq("event_id", eventId);
            q = q.order("created_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"live_event_instances">[];
        },
    });
}

export function useLiveCrewAssignments(liveEventId?: string) {
    return useQuery({
        queryKey: ["live_crew_assignments", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("live_crew_assignments").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("created_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"live_crew_assignments">[];
        },
    });
}

export function useUpdateLiveCrewAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"live_crew_assignments"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("live_crew_assignments")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as Tables<"live_crew_assignments">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live_crew_assignments"] }),
    });
}

export function useStrikeSequences(liveEventId?: string) {
    return useQuery({
        queryKey: ["strike_sequences", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("strike_sequences").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("sequence", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"strike_sequences">[];
        },
    });
}

export function useEnvironmentalReadings(liveEventId?: string) {
    return useQuery({
        queryKey: ["environmental_readings", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("environmental_readings").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("recorded_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"environmental_readings">[];
        },
    });
}

export function useFohZones(liveEventId?: string) {
    return useQuery({
        queryKey: ["foh_zones", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("foh_zones").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("name", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"foh_zones">[];
        },
    });
}

export function useFohZoneReadings(liveEventId?: string) {
    return useQuery({
        queryKey: ["foh_zone_readings", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("foh_zone_readings").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("recorded_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"foh_zone_readings">[];
        },
    });
}

export function useCommChannels(liveEventId?: string) {
    return useQuery({
        queryKey: ["comm_channels", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("comm_channels").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("channel_number", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"comm_channels">[];
        },
    });
}

export function useDepartmentStatuses(liveEventId?: string) {
    return useQuery({
        queryKey: ["department_statuses", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("department_statuses").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("department", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"department_statuses">[];
        },
    });
}

export function useGuestIncidents(liveEventId?: string) {
    return useQuery({
        queryKey: ["guest_incidents", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("guest_incidents").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("reported_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"guest_incidents">[];
        },
    });
}

export function useReadinessGates(liveEventId?: string) {
    return useQuery({
        queryKey: ["readiness_gates", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("readiness_gates").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("gate_number", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"readiness_gates">[];
        },
    });
}

export function useRosCues(liveEventId?: string) {
    return useQuery({
        queryKey: ["ros_cues", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("ros_cues").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("sequence", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"ros_cues">[];
        },
    });
}

export function useUpdateRosCue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"ros_cues"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("ros_cues")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as Tables<"ros_cues">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ros_cues"] }),
    });
}

export function useVipGuests(liveEventId?: string) {
    return useQuery({
        queryKey: ["vip_guests", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("vip_guests").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("name", { ascending: true });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"vip_guests">[];
        },
    });
}

export function useEquipmentCheckIns(liveEventId?: string) {
    return useQuery({
        queryKey: ["equipment_check_ins", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("equipment_check_ins").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("created_at", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"equipment_check_ins">[];
        },
    });
}

export function useLiveFinancialSnapshots(liveEventId?: string) {
    return useQuery({
        queryKey: ["live_financial_snapshots", liveEventId],
        queryFn: async () => {
            const sb = getSupabase();
            let q = sb.from("live_financial_snapshots").select("*");
            if (liveEventId) q = q.eq("live_event_id", liveEventId);
            q = q.order("snapshot_time", { ascending: false }).limit(1);
            const { data, error } = await q;
            if (error) throw error;
            return data as Tables<"live_financial_snapshots">[];
        },
    });
}

export function usePostEventReports() {
    return useQuery({
        queryKey: ["post_event_reports"],
        queryFn: async () => {
            const sb = getSupabase();
            const { data, error } = await sb
                .from("post_event_reports")
                .select("*")
                .order("compiled_at", { ascending: false });
            if (error) throw error;
            return data as Tables<"post_event_reports">[];
        },
    });
}
