"use client";

/**
 * Admin entity hooks: organizations, teams, team_members, invitations,
 * user_profiles (people), user_directory, audit logs, temporary_access_grants,
 * approval_steps, goals, vendor_communications, brands, work_orders,
 * dispatch, service_requests, checklists, checklist_templates.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiFetch, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "./database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export const useOrganizations = makeListHook<Tables<"organizations">>(
    "organization",
    "/api/organizations",
    { sort_by: "name", sort_order: "asc" }
);

export function useOrganization(id: string) {
    return useQuery({
        queryKey: ["organization", "detail", id],
        queryFn: () => apiGet<Tables<"organizations">>("/api/organizations", id),
        enabled: !!id,
    });
}

export function useUpdateOrganization() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Tables<"organizations">>("/api/organizations", id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["organization"] });
            qc.invalidateQueries({ queryKey: ["organization", "detail", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// TEAMS
// ═══════════════════════════════════════════════════════════════

export const useTeams = makeListHook<Record<string, unknown>>("team", "/api/teams", {
    sort_by: "name",
    sort_order: "asc",
});

export function useTeamDetail(teamId?: string | null) {
    return useQuery({
        queryKey: ["team", "detail", teamId],
        queryFn: () => apiGet<Record<string, unknown>>("/api/teams", teamId!),
        enabled: !!teamId,
    });
}

export function useCreateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Record<string, unknown>>("/api/teams", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

export function useUpdateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Record<string, unknown>>("/api/teams", id, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

export function useDeleteTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete("/api/teams", id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

// ─── Team Members ───
export function useTeamMembersPage(teamId?: string | null) {
    return useQuery({
        queryKey: ["team_member", teamId],
        queryFn: async () => {
            const res = await apiFetch<{ data: unknown[] }>(`/api/teams/${teamId}/members`);
            return res.data;
        },
        enabled: !!teamId,
    });
}

export function useAddTeamMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            teamId,
            ...payload
        }: {
            teamId: string;
            user_id: string;
            role?: string;
        }) => {
            const res = await apiFetch<{ data: unknown }>(`/api/teams/${teamId}/members`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return res.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team_member"] }),
    });
}

export function useRemoveTeamMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
            await apiFetch<void>(`/api/teams/${teamId}/members/${memberId}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team_member"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// INVITATIONS
// ═══════════════════════════════════════════════════════════════

export const useInvitationsList = makeListHook<Tables<"invitations">>(
    "invitation",
    "/api/invitations",
    { sort_by: "created_at", sort_order: "desc" }
);

export function useUpdateInvitation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Tables<"invitations">>("/api/invitations", id, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["invitation"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// USER PROFILES (People)
// ═══════════════════════════════════════════════════════════════

export const usePeople = makeListHook<Tables<"user_profiles">>("people", "/api/user-profiles", {
    sort_by: "display_name",
    sort_order: "asc",
});
export const usePerson = makeDetailHook<Tables<"user_profiles">>("people", "/api/user-profiles");
export const useCreatePerson = makeCreateHook<Tables<"user_profiles">>(
    "people",
    "/api/user-profiles"
);
export const useUpdatePerson = makeUpdateHook<Tables<"user_profiles">>(
    "people",
    "/api/user-profiles"
);
export const useDeletePerson = makeDeleteHook("people", "/api/user-profiles");

export const useUserDirectory = makeListHook<Tables<"user_profiles">>(
    "user_directory",
    "/api/user-directory",
    { sort_by: "display_name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════

export function useLoginAuditLog(limit = 100) {
    return useQuery({
        queryKey: ["login_audit_log", { limit }],
        queryFn: async () => {
            const res = await apiList<Tables<"login_audit_log">>("/api/login-audit-log", {
                sort_by: "attempted_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

export function useRoleChangeLog(limit = 100) {
    return useQuery({
        queryKey: ["role_change_log", { limit }],
        queryFn: async () => {
            const res = await apiList<Tables<"role_change_log">>("/api/role-change-log", {
                sort_by: "changed_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

export function useAccessAuditLog(limit = 100) {
    return useQuery({
        queryKey: ["access_audit_log", { limit }],
        queryFn: async () => {
            const res = await apiList<Tables<"access_audit_log">>("/api/access-audit-log", {
                sort_by: "performed_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ─── Activity Log ───
export function useActivityLog(entityType?: string, entityId?: string, limit = 20) {
    return useQuery({
        queryKey: ["activity_log_entry", { entity_type: entityType, entity_id: entityId }],
        queryFn: async () => {
            const res = await apiList<Tables<"activity_log">>("/api/activity-log", {
                entity_type: entityType,
                entity_id: entityId,
                sort_by: "created_at",
                sort_order: "desc",
                per_page: limit,
            });
            return res.data;
        },
    });
}

export function useActivityLogRecent(limit = 10) {
    return useQuery({
        queryKey: ["activity_log_recent", { limit }],
        queryFn: async () => {
            const res = await apiList<Tables<"activity_log">>("/api/activity-log", {
                sort_by: "created_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ─── Activities (event-based) ───
export function useActivities(eventId?: string, projectId?: string) {
    return useQuery({
        queryKey: ["activity", { event_id: eventId, project_id: projectId }],
        queryFn: () =>
            apiList<Tables<"activities">>("/api/activity-log", {
                event_id: eventId,
                project_id: projectId,
                sort_by: "start_time",
                sort_order: "asc",
            }).then((r) => r.data),
    });
}

export function useCreateActivity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Tables<"activities">>("/api/activity-log", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
    });
}

export function useUpdateActivity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Tables<"activities">>("/api/activity-log", id, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// TEMPORARY ACCESS GRANTS
// ═══════════════════════════════════════════════════════════════

export const useTemporaryAccessGrants = makeListHook<Tables<"temporary_access_grants">>(
    "temporary_access_grant",
    "/api/temporary-access-grants",
    { sort_by: "created_at", sort_order: "desc" }
);

export function useRevokeTemporaryGrant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiUpdate<Tables<"temporary_access_grants">>("/api/temporary-access-grants", id, {
                status: "revoked",
                revoked_at: new Date().toISOString(),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["temporary_access_grant"] }),
    });
}

// APPROVAL STEPS → canonical in hooks-workflows.ts (join-aware)

// ═══════════════════════════════════════════════════════════════
// VENDOR COMMUNICATIONS
// ═══════════════════════════════════════════════════════════════

export const useVendorCommunications = makeListHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications",
    { sort_by: "sent_at", sort_order: "desc" }
);
export const useVendorCommunication = makeDetailHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications"
);
export const useCreateVendorCommunication = makeCreateHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications",
    ["vendor"]
);

// ═══════════════════════════════════════════════════════════════
// BRANDS
// ═══════════════════════════════════════════════════════════════

export const useBrands = makeListHook<Tables<"brands">>("brand", "/api/brands", {
    sort_by: "name",
    sort_order: "asc",
});
export const useBrand = makeDetailHook<Tables<"brands">>("brand", "/api/brands");
export const useCreateBrand = makeCreateHook<Tables<"brands">>("brand", "/api/brands");
export const useUpdateBrand = makeUpdateHook<Tables<"brands">>("brand", "/api/brands");

// ═══════════════════════════════════════════════════════════════
// WORK ORDERS
// ═══════════════════════════════════════════════════════════════

export const useWorkOrders = makeListHook<Tables<"work_orders">>("work_order", "/api/work-orders", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useWorkOrder = makeDetailHook<Tables<"work_orders">>("work_order", "/api/work-orders");
export const useCreateWorkOrder = makeCreateHook<Tables<"work_orders">>(
    "work_order",
    "/api/work-orders"
);
export const useUpdateWorkOrder = makeUpdateHook<Tables<"work_orders">>(
    "work_order",
    "/api/work-orders"
);
export const useDeleteWorkOrder = makeDeleteHook("work_order", "/api/work-orders");

// ═══════════════════════════════════════════════════════════════
// DISPATCH
// ═══════════════════════════════════════════════════════════════

export const useDispatchRecords = makeListHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useDispatchRecord = makeDetailHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useCreateDispatchRecord = makeCreateHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useUpdateDispatchRecord = makeUpdateHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useDeleteDispatchRecord = makeDeleteHook("dispatch", "/api/dispatch");

// ═══════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useServiceRequests = makeListHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useServiceRequest = makeDetailHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useCreateServiceRequest = makeCreateHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useUpdateServiceRequest = makeUpdateHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useDeleteServiceRequest = makeDeleteHook("service_request", "/api/service-requests");

// ═══════════════════════════════════════════════════════════════
// CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export const useChecklists = makeListHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists",
    { sort_by: "name", sort_order: "asc" }
);
export const useChecklist = makeDetailHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists"
);
export const useCreateChecklist = makeCreateHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists"
);
export const useUpdateChecklist = makeUpdateHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists"
);
export const useDeleteChecklist = makeDeleteHook("checklist", "/api/checklists");

// ─── Checklist Templates ───
export const useChecklistTemplates = makeListHook<Tables<"checklist_templates">>(
    "checklist_template",
    "/api/checklist-templates",
    { sort_by: "name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// RISK ASSESSMENTS
// ═══════════════════════════════════════════════════════════════

export const useRiskAssessments = makeListHook<Tables<"vendor_risk_scores">>(
    "risk_assessment",
    "/api/risk-assessments",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateRiskAssessment = makeCreateHook<Tables<"vendor_risk_scores">>(
    "risk_assessment",
    "/api/risk-assessments"
);

// ═══════════════════════════════════════════════════════════════
// SYSTEM HEALTH
// ═══════════════════════════════════════════════════════════════

export const useSlaDefinitions = makeListHook<Tables<"sla_definitions">>(
    "sla_definition",
    "/api/sla-definitions",
    { sort_by: "name", sort_order: "asc" }
);
export const useSlaTracking = makeListHook<Tables<"sla_tracking">>(
    "sla_tracking",
    "/api/sla-tracking",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useResilienceTargets = makeListHook<Tables<"resilience_targets">>(
    "resilience_target",
    "/api/resilience-targets",
    { sort_by: "service_name", sort_order: "asc" }
);
export const useServiceHealthChecks = makeListHook<Tables<"sla_tracking">>(
    "service_health_check",
    "/api/service-health-checks",
    { sort_by: "service_name", sort_order: "asc" }
);

export function useDomainEvents(limit = 20) {
    return useQuery({
        queryKey: ["domain_event", { limit }],
        queryFn: async () => {
            const res = await apiList<Tables<"domain_events">>("/api/domain-events", {
                sort_by: "created_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// COMMENTS (legacy — deprecated in favor of messaging)
// ═══════════════════════════════════════════════════════════════

/** @deprecated Use useEntityMessages from hooks-messaging.ts when messaging_enabled flag is on. */
export function useComments(
    entityType: "project" | "task" | "approval" | "deal",
    entityId: string
) {
    return useQuery({
        queryKey: ["comment", { entity_type: entityType, entity_id: entityId }],
        queryFn: async () => {
            const res = await apiList<Tables<"comments">>("/api/comments", {
                entity_type: entityType,
                entity_id: entityId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
        enabled: !!entityType && !!entityId,
    });
}

/** @deprecated Use useSendMessage from hooks-messaging.ts when messaging_enabled flag is on. */
export function useCreateComment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (comment: Record<string, unknown>) =>
            apiCreate<Tables<"comments">>("/api/comments", comment),
        onSuccess: (_data, variables) =>
            qc.invalidateQueries({
                queryKey: [
                    "comment",
                    {
                        entity_type: variables.entity_type as string,
                        entity_id: variables.entity_id as string,
                    },
                ],
            }),
    });
}

// ═══════════════════════════════════════════════════════════════
// MY TASKS / MY DOCUMENTS (user-scoped home hooks)
// ═══════════════════════════════════════════════════════════════

export function useMyTasks() {
    return useQuery({
        queryKey: ["my-tasks"],
        queryFn: async () => {
            const { getSupabase } = await import("./client");
            const {
                data: { user },
            } = await getSupabase().auth.getUser();
            if (!user) return [];
            const res = await apiList<Tables<"tasks"> & { projects: { name: string } | null }>(
                "/api/tasks",
                {
                    assignee_id: user.id,
                    sort_by: "due_date",
                    sort_order: "asc",
                }
            );
            return res.data;
        },
    });
}

export function useMyTaskCounts() {
    return useQuery({
        queryKey: ["my-task-counts"],
        queryFn: async () => {
            const res = await fetch("/api/tasks/counts");
            if (!res.ok)
                return { total: 0, overdue: 0, dueToday: 0, dueThisWeek: 0, inProgress: 0 };
            return res.json() as Promise<{
                total: number;
                overdue: number;
                dueToday: number;
                dueThisWeek: number;
                inProgress: number;
            }>;
        },
    });
}

export const useMyDocuments = makeListHook<Tables<"documents">>("my_document", "/api/documents", {
    sort_by: "updated_at",
    sort_order: "desc",
});

// ═══════════════════════════════════════════════════════════════
// AGGREGATE VIEWS
// ═══════════════════════════════════════════════════════════════

export function useSOWDeliverableSummary(sowId?: string) {
    const params = sowId ? `?sow_id=${sowId}` : "";
    return useQuery({
        queryKey: ["v_sow_deliverable_summary", sowId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>(
                `/api/v-sow-deliverable-summary${params}`
            ).then((r) => r.data),
    });
}

export function useClientInvoiceAging() {
    return useQuery({
        queryKey: ["v_client_invoice_aging"],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>("/api/v-client-invoice-aging").then(
                (r) => r.data
            ),
    });
}

// ═══════════════════════════════════════════════════════════════
// ORG MEMBERS (for messaging people picker)
// ═══════════════════════════════════════════════════════════════

export function useOrgMembers() {
    return useQuery({
        queryKey: ["org_members"],
        queryFn: async () => {
            const { getSupabase } = await import("./client");
            const sb = getSupabase();
            const {
                data: { user },
            } = await sb.auth.getUser();
            if (!user) return [];
            const { data } = await sb
                .from("org_memberships")
                .select("user_id, role, user_profiles(display_name, avatar_url, email)")
                .neq("user_id", user.id);
            return data ?? [];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// LIVE CREW ASSIGNMENTS (for org-chart page)
// ═══════════════════════════════════════════════════════════════

export const useLiveCrewAssignmentsPage = makeListHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments",
    { sort_by: "role", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// TAGS (cross-entity tagging — Module 10)
// ═══════════════════════════════════════════════════════════════
export const useTags = makeListHook<Tables<"tags">>("tag", "/api/tags", {
    sort_by: "name",
    sort_order: "asc",
});
export const useTag = makeDetailHook<Tables<"tags">>("tag", "/api/tags");
export const useCreateTag = makeCreateHook<Tables<"tags">>("tag", "/api/tags");
export const useUpdateTag = makeUpdateHook<Tables<"tags">>("tag", "/api/tags");
export const useDeleteTag = makeDeleteHook("tag", "/api/tags");
