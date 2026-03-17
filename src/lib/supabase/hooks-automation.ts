"use client";

/**
 * Automation, Notifications, Custom Fields, Dashboards, Reports, SLA,
 * Surveys, Time Tracking Policies, Data Export, Saved Views, Workflows.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiFetch, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "./database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";
import type { CustomFieldDefinitionRow } from "./hook-types";

// ═══════════════════════════════════════════════════════════════
// AUTOMATIONS
// ═══════════════════════════════════════════════════════════════

export const useAutomations = makeListHook<Tables<"automations">>(
    "automation",
    "/api/automations",
    { sort_by: "name", sort_order: "asc" }
);
export const useAutomation = makeDetailHook<Tables<"automations">>(
    "automation",
    "/api/automations"
);
export const useCreateAutomation = makeCreateHook<Tables<"automations">>(
    "automation",
    "/api/automations"
);
export const useUpdateAutomation = makeUpdateHook<Tables<"automations">>(
    "automation",
    "/api/automations"
);
export const useDeleteAutomation = makeDeleteHook("automation", "/api/automations");

export function useAutomationWithRules(id: string) {
    return useQuery({
        queryKey: ["automation", "detail", id, "rules"],
        queryFn: () => apiGet<Tables<"automations">>("/api/automations", id),
        enabled: !!id,
    });
}

export const useCreateAutomationRule = makeCreateHook<Tables<"automation_rules">>(
    "automation_rule",
    "/api/automation-rules",
    ["automation"]
);

// ═══════════════════════════════════════════════════════════════
// AUTOMATION EXECUTIONS
// ═══════════════════════════════════════════════════════════════

export const useAutomationExecutions = makeListHook<Tables<"automation_executions">>(
    "automation_execution",
    "/api/automation-executions",
    { sort_by: "started_at", sort_order: "desc" }
);
export const useCreateAutomationExecution = makeCreateHook<Tables<"automation_executions">>(
    "automation_execution",
    "/api/automation-executions"
);
export const useUpdateAutomationExecution = makeUpdateHook<Tables<"automation_executions">>(
    "automation_execution",
    "/api/automation-executions"
);

// ─── Automation Logs alias ───
export function useAutomationLogs(automationId?: string) {
    return useQuery({
        queryKey: ["automation_log", { automation_id: automationId }],
        queryFn: () =>
            apiList<Tables<"automation_executions">>("/api/automation-logs", {
                automation_id: automationId,
                sort_by: "executed_at",
                sort_order: "desc",
            }).then((r) => r.data),
    });
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export const useWorkflows = makeListHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows",
    { sort_by: "name", sort_order: "asc" }
);
export const useWorkflow = makeDetailHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows"
);
export const useCreateWorkflow = makeCreateHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows"
);
export const useUpdateWorkflow = makeUpdateHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows"
);
export const useDeleteWorkflow = makeDeleteHook("workflow", "/api/workflows");

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function useNotifications(unreadOnly?: boolean) {
    return useQuery({
        queryKey: ["notification", { unreadOnly }],
        queryFn: async () => {
            const res = await apiList<Tables<"notifications">>("/api/notifications", {
                ...(unreadOnly ? { read: false } : {}),
                sort_by: "created_at",
                sort_order: "desc",
                per_page: 50,
            });
            return res.data;
        },
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ["notification", "unread_count"],
        queryFn: async () => {
            const res = await apiFetch<{ count: number }>("/api/notifications/unread-count");
            return res.count ?? 0;
        },
    });
}

export const useCreateNotification = makeCreateHook<Tables<"notifications">>(
    "notification",
    "/api/notifications"
);

export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            apiUpdate<Tables<"notifications">>("/api/notifications", id, {
                read: true,
                read_at: new Date().toISOString(),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notification"] }),
    });
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await apiFetch<void>("/api/notifications/mark-all-read", { method: "POST" });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notification"] }),
    });
}

// NOTIFICATION PREFERENCES → canonical in hooks-workflows.ts (join-aware)
// useUpsertNotificationPreference kept here as it doesn't conflict
export function useUpsertNotificationPreference() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (pref: Record<string, unknown>) =>
            apiCreate<Tables<"notification_preferences">>("/api/notification-preferences", pref),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notification_preference"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// EMAIL MESSAGES
// ═══════════════════════════════════════════════════════════════

export const useEmailMessages = makeListHook<Tables<"email_messages">>(
    "email_message",
    "/api/email-messages",
    { sort_by: "received_at", sort_order: "desc" }
);
export const useCreateEmailMessage = makeCreateHook<Tables<"email_messages">>(
    "email_message",
    "/api/email-messages"
);

// ═══════════════════════════════════════════════════════════════
// SAVED VIEWS
// ═══════════════════════════════════════════════════════════════

export const useSavedViews = makeListHook<Tables<"saved_views">>("saved_view", "/api/saved-views", {
    sort_by: "name",
    sort_order: "asc",
});
export const useSavedView = makeDetailHook<Tables<"saved_views">>("saved_view", "/api/saved-views");
export const useCreateSavedView = makeCreateHook<Tables<"saved_views">>(
    "saved_view",
    "/api/saved-views"
);
export const useUpdateSavedView = makeUpdateHook<Tables<"saved_views">>(
    "saved_view",
    "/api/saved-views"
);
export const useDeleteSavedView = makeDeleteHook("saved_view", "/api/saved-views");

// ═══════════════════════════════════════════════════════════════
// CUSTOM FIELD DEFINITIONS & VALUES
// ═══════════════════════════════════════════════════════════════

export function useCustomFieldDefinitions(entityType?: string) {
    return useQuery({
        queryKey: ["custom_field_definition", { entity_type: entityType }],
        queryFn: async () => {
            const res = await apiList<Tables<"custom_field_definitions">>(
                "/api/custom-field-definitions",
                {
                    entity_type: entityType,
                    sort_by: "display_order",
                    sort_order: "asc",
                }
            );
            return (res.data ?? []) as CustomFieldDefinitionRow[];
        },
    });
}

export const useCreateCustomFieldDefinition = makeCreateHook<Tables<"custom_field_definitions">>(
    "custom_field_definition",
    "/api/custom-field-definitions"
);
export const useUpdateCustomFieldDefinition = makeUpdateHook<Tables<"custom_field_definitions">>(
    "custom_field_definition",
    "/api/custom-field-definitions"
);

// ─── Legacy alias ───
export const useCustomFields = useCustomFieldDefinitions;
export const useCreateCustomField = useCreateCustomFieldDefinition;

export function useCustomFieldValues(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["custom_field_value", { entity_type: entityType, entity_id: entityId }],
        queryFn: async () => {
            const res = await apiList<Tables<"custom_field_values">>("/api/custom-field-values", {
                entity_type: entityType,
                entity_id: entityId,
            });
            return res.data;
        },
        enabled: !!entityType && !!entityId,
    });
}

export function useUpsertCustomFieldValue() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (val: Record<string, unknown>) =>
            apiCreate<Tables<"custom_field_values">>("/api/custom-field-values", val),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_field_value"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARDS
// ═══════════════════════════════════════════════════════════════

export const useDashboards = makeListHook<Tables<"dashboards">>("dashboard", "/api/dashboards", {
    sort_by: "name",
    sort_order: "asc",
});
export const useDashboard = makeDetailHook<Tables<"dashboards">>("dashboard", "/api/dashboards");
export const useCreateDashboard = makeCreateHook<Tables<"dashboards">>(
    "dashboard",
    "/api/dashboards"
);
export const useUpdateDashboard = makeUpdateHook<Tables<"dashboards">>(
    "dashboard",
    "/api/dashboards"
);

export function useDashboardWithWidgets(id: string) {
    return useQuery({
        queryKey: ["dashboard", "detail", id, "widgets"],
        queryFn: () => apiGet<Tables<"dashboards">>("/api/dashboards", id),
        enabled: !!id,
    });
}

export const useDashboardWidgets = makeListHook<Tables<"dashboard_widgets">>(
    "dashboard_widget",
    "/api/dashboard-widgets",
    { sort_by: "sort_order", sort_order: "asc" }
);
export const useCreateDashboardWidget = makeCreateHook<Tables<"dashboard_widgets">>(
    "dashboard_widget",
    "/api/dashboard-widgets",
    ["dashboard"]
);
export const useUpdateDashboardWidget = makeUpdateHook<Tables<"dashboard_widgets">>(
    "dashboard_widget",
    "/api/dashboard-widgets",
    ["dashboard"]
);

// ═══════════════════════════════════════════════════════════════
// REPORT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const useReportDefinitions = makeListHook<Tables<"report_definitions">>(
    "report_definition",
    "/api/report-definitions",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateReportDefinition = makeCreateHook<Tables<"report_definitions">>(
    "report_definition",
    "/api/report-definitions"
);
export const useUpdateReportDefinition = makeUpdateHook<Tables<"report_definitions">>(
    "report_definition",
    "/api/report-definitions"
);

// ═══════════════════════════════════════════════════════════════
// AI REPORT QUERIES
// ═══════════════════════════════════════════════════════════════

export const useAiReportQueries = makeListHook<Tables<"ai_report_queries">>(
    "ai_report_query",
    "/api/ai-report-queries",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateAiReportQuery = makeCreateHook<Tables<"ai_report_queries">>(
    "ai_report_query",
    "/api/ai-report-queries"
);

// ═══════════════════════════════════════════════════════════════
// SLA POLICIES
// ═══════════════════════════════════════════════════════════════

export const useSlaPolicies = makeListHook<Tables<"sla_policies">>(
    "sla_policy",
    "/api/sla-policies",
    { sort_by: "priority", sort_order: "asc" }
);
export const useCreateSlaPolicy = makeCreateHook<Tables<"sla_policies">>(
    "sla_policy",
    "/api/sla-policies"
);

export function useSlaStatus() {
    return useQuery({
        queryKey: ["sla_status"],
        queryFn: async () => {
            const res = await apiList<Record<string, unknown>>("/api/sla-status", {
                sort_by: "sla_response_due_at",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// SURVEY TEMPLATES & RESPONSES
// ═══════════════════════════════════════════════════════════════

export const useSurveyTemplates = makeListHook<Tables<"survey_templates">>(
    "survey_template",
    "/api/survey-templates",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateSurveyTemplate = makeCreateHook<Tables<"survey_templates">>(
    "survey_template",
    "/api/survey-templates"
);
export const useUpdateSurveyTemplate = makeUpdateHook<Tables<"survey_templates">>(
    "survey_template",
    "/api/survey-templates"
);

export const useSurveyResponses = makeListHook<Tables<"survey_responses">>(
    "survey_response",
    "/api/survey-responses",
    { sort_by: "submitted_at", sort_order: "desc" }
);
export const useCreateSurveyResponse = makeCreateHook<Tables<"survey_responses">>(
    "survey_response",
    "/api/survey-responses"
);

// ═══════════════════════════════════════════════════════════════
// TIME TRACKING POLICIES
// ═══════════════════════════════════════════════════════════════

export function useTimeTrackingPolicy() {
    return useQuery({
        queryKey: ["time_tracking_policy"],
        queryFn: async () => {
            const res = await apiList<Tables<"time_tracking_policies">>(
                "/api/time-tracking-policies",
                { is_active: true }
            );
            return (res.data as Tables<"time_tracking_policies">[])?.[0] ?? null;
        },
    });
}

export function useUpsertTimeTrackingPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (policy: Record<string, unknown>) =>
            apiCreate<Tables<"time_tracking_policies">>("/api/time-tracking-policies", policy),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["time_tracking_policy"] }),
    });
}

export function useTimeTrackingCompliance() {
    return useQuery({
        queryKey: ["time_tracking_compliance"],
        queryFn: async () => {
            const res = await apiList<Record<string, unknown>>("/api/time-tracking-compliance", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DATA EXPORT REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useDataExportRequests = makeListHook<Tables<"data_export_requests">>(
    "data_export_request",
    "/api/data-export-requests",
    { sort_by: "requested_at", sort_order: "desc" }
);

export function useCreateDataExportRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { export_format: string }) =>
            apiCreate<Tables<"data_export_requests">>(
                "/api/data-export-requests",
                payload as Record<string, unknown>
            ),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["data_export_request"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE DRIFT & ORG SECURITY (API-route backed)
// ═══════════════════════════════════════════════════════════════

export function useComplianceDrift(organizationId?: string) {
    return useQuery({
        queryKey: ["compliance_drift", organizationId],
        queryFn: async () => {
            const res = await apiFetch<Record<string, unknown>>(
                `/api/settings/drift-detection?organization_id=${organizationId}`
            );
            return res;
        },
        enabled: !!organizationId,
    });
}

export function useOrgSecuritySettings(organizationId?: string) {
    return useQuery({
        queryKey: ["org_security", organizationId],
        queryFn: async () => {
            const res = await apiFetch<{ organization: Record<string, unknown> }>(
                `/api/organizations/${organizationId}/security`
            );
            return res.organization;
        },
        enabled: !!organizationId,
    });
}

export function useUpdateOrgSecuritySettings(organizationId?: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (updates: Record<string, unknown>) => {
            const res = await apiFetch<{ organization: Record<string, unknown> }>(
                `/api/organizations/${organizationId}/security`,
                {
                    method: "PATCH",
                    body: JSON.stringify(updates),
                }
            );
            return res.organization;
        },
        onSuccess: (data) => {
            qc.setQueryData(["org_security", organizationId], data);
        },
    });
}
