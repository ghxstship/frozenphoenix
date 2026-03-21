"use client";

/* ═══════════════════════════════════════════════════════════════
   Lightweight React Query hooks for context-switcher popovers.
   These fetch minimal columns (id, name, status, logo) and use
   long stale times since switcher lists don't need real-time.
   ═══════════════════════════════════════════════════════════════ */

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { SwitcherItem, Team, TeamMember } from "@/types/workspace-context";

const SWITCHER_STALE_TIME = 30_000; // 30s
const SWITCHER_LIMIT = 200;

// ─── Teams ───────────────────────────────────────────────────

export function useTeamsForSwitcher(orgId: string | null | undefined) {
    return useQuery<Team[]>({
        queryKey: ["teams-switcher", orgId],
        queryFn: async () => {
            if (!orgId) return [];
            const { data, error } = await getSupabase()
                .from("teams")
                .select("id, organization_id, name, slug, description, avatar_url, is_default, created_by, created_at, updated_at")
                .eq("organization_id", orgId)
                .order("is_default", { ascending: false })
                .order("name")
                .limit(SWITCHER_LIMIT);
            if (error) throw error;
            return (data ?? []) as Team[];
        },
        enabled: !!orgId,
        staleTime: SWITCHER_STALE_TIME,
    });
}

// ─── Team Members ────────────────────────────────────────────

export function useTeamMembers(teamId: string | null | undefined) {
    return useQuery<TeamMember[]>({
        queryKey: ["team-members", teamId],
        queryFn: async () => {
            if (!teamId) return [];
            const { data, error } = await getSupabase()
                .from("team_members")
                .select("id, team_id, user_id, role, joined_at, user_profiles(id, name, avatar_url)")
                .eq("team_id", teamId)
                .order("role")
                .limit(SWITCHER_LIMIT);
            if (error) throw error;
            return (data ?? []) as TeamMember[];
        },
        enabled: !!teamId,
        staleTime: SWITCHER_STALE_TIME,
    });
}

// ─── Clients (companies with company_type = 'client') ────────

export function useClientsForSwitcher(
    orgId: string | null | undefined,
    teamId?: string | null
) {
    return useQuery<SwitcherItem[]>({
        queryKey: ["clients-switcher", orgId, teamId],
        queryFn: async () => {
            if (!orgId) return [];
            let query = getSupabase()
                .from("companies")
                .select("id, name, logo_url, status")
                .eq("organization_id", orgId)
                .eq("company_type", "client")
                .order("name")
                .limit(SWITCHER_LIMIT);
            if (teamId) {
                query = query.eq("team_id", teamId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as SwitcherItem[];
        },
        enabled: !!orgId,
        staleTime: SWITCHER_STALE_TIME,
    });
}

// ─── Projects ────────────────────────────────────────────────

export function useProjectsForSwitcher(
    orgId: string | null | undefined,
    options?: { teamId?: string | null; clientId?: string | null }
) {
    const teamId = options?.teamId;
    const clientId = options?.clientId;

    return useQuery<SwitcherItem[]>({
        queryKey: ["projects-switcher", orgId, teamId, clientId],
        queryFn: async () => {
            if (!orgId) return [];
            let query = getSupabase()
                .from("projects")
                .select("id, name, status")
                .eq("organization_id", orgId)
                .order("updated_at", { ascending: false })
                .limit(SWITCHER_LIMIT);
            if (teamId) {
                query = query.eq("team_id", teamId);
            }
            if (clientId) {
                query = query.eq("client_company_id", clientId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as SwitcherItem[];
        },
        enabled: !!orgId,
        staleTime: SWITCHER_STALE_TIME,
    });
}

// ─── Activations (scoped to project) ─────────────────────────

export function useActivationsForSwitcher(projectId: string | null | undefined) {
    return useQuery<SwitcherItem[]>({
        queryKey: ["activations-switcher", projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const { data, error } = await getSupabase()
                .from("activations")
                .select("id, name, status")
                .eq("project_id", projectId)
                .order("name")
                .limit(SWITCHER_LIMIT);
            if (error) throw error;
            return (data ?? []) as SwitcherItem[];
        },
        enabled: !!projectId,
        staleTime: SWITCHER_STALE_TIME,
    });
}
