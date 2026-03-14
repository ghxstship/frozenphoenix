"use client";

/**
 * Supabase hooks for V2 competitive feature gap tables.
 * Covers: automation executions, revenue recognition, time tracking policies,
 * notifications, email messages, survey templates/responses, SLA policies,
 * custom fields, project templates, AI report queries, portal sessions.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "./client";

// ═══════════════════════════════════════════════════════════════
// AUTOMATION EXECUTIONS (Theme F1)
// ═══════════════════════════════════════════════════════════════

export function useAutomationExecutions(automationId?: string) {
    return useQuery({
        queryKey: ["automation_executions", automationId],
        queryFn: async () => {
            let q = fromTable("automation_executions")
                .select("*, automations(name)")
                .order("started_at", { ascending: false })
                .limit(100);
            if (automationId) q = q.eq("automation_id", automationId);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateAutomationExecution() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (exec: Record<string, unknown>) => {
            const { data, error } = await fromTable("automation_executions")
                .insert(exec)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["automation_executions"] }),
    });
}

export function useUpdateAutomationExecution() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Record<string, unknown>) => {
            const { data, error } = await fromTable("automation_executions")
                .update(updates)
                .eq("id", id as string)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["automation_executions"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// REVENUE RECOGNITION (Theme E1)
// ═══════════════════════════════════════════════════════════════

export function useRevenueRecognitionEntries(projectId?: string) {
    return useQuery({
        queryKey: ["revenue_recognition_entries", projectId],
        queryFn: async () => {
            let q = fromTable("revenue_recognition_entries")
                .select("*, projects(name)")
                .order("period_start", { ascending: false });
            if (projectId) q = q.eq("project_id", projectId);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

export function useRevenueRecognitionSummary() {
    return useQuery({
        queryKey: ["revenue_recognition_summary"],
        queryFn: async () => {
            const { data, error } = await fromTable("v_revenue_recognition_summary")
                .select("*")
                .order("project_name");
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateRevenueRecognition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (entry: Record<string, unknown>) => {
            const { data, error } = await fromTable("revenue_recognition_entries")
                .insert(entry)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["revenue_recognition_entries"] });
            qc.invalidateQueries({ queryKey: ["revenue_recognition_summary"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// TIME TRACKING POLICIES (Theme E3)
// ═══════════════════════════════════════════════════════════════

export function useTimeTrackingPolicy() {
    return useQuery({
        queryKey: ["time_tracking_policy"],
        queryFn: async () => {
            const { data, error } = await fromTable("time_tracking_policies")
                .select("*")
                .eq("is_active", true)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
    });
}

export function useUpsertTimeTrackingPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (policy: Record<string, unknown>) => {
            const { data, error } = await fromTable("time_tracking_policies")
                .upsert(policy)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["time_tracking_policy"] }),
    });
}

export function useTimeTrackingCompliance() {
    return useQuery({
        queryKey: ["time_tracking_compliance"],
        queryFn: async () => {
            const { data, error } = await fromTable("v_time_tracking_compliance")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS (Theme G2)
// ═══════════════════════════════════════════════════════════════

export function useNotifications(unreadOnly?: boolean) {
    return useQuery({
        queryKey: ["notifications", { unreadOnly }],
        queryFn: async () => {
            let q = fromTable("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);
            if (unreadOnly) q = q.eq("read", false);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ["notifications", "unread_count"],
        queryFn: async () => {
            const { count, error } = await fromTable("notifications")
                .select("*", { count: "exact", head: true })
                .eq("read", false);
            if (error) throw error;
            return count ?? 0;
        },
    });
}

export function useCreateNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (notif: Record<string, unknown>) => {
            const { data, error } = await fromTable("notifications")
                .insert(notif)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}

export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await fromTable("notifications")
                .update({ read: true, read_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { error } = await fromTable("notifications")
                .update({ read: true, read_at: new Date().toISOString() })
                .eq("read", false);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION PREFERENCES (Theme G3)
// ═══════════════════════════════════════════════════════════════

export function useNotificationPreferences() {
    return useQuery({
        queryKey: ["notification_preferences"],
        queryFn: async () => {
            const { data, error } = await fromTable("notification_preferences")
                .select("*")
                .maybeSingle();
            if (error) throw error;
            return data;
        },
    });
}

export function useUpsertNotificationPreference() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (pref: Record<string, unknown>) => {
            const { data, error } = await fromTable("notification_preferences")
                .upsert(pref, { onConflict: "user_id" })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notification_preferences"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// EMAIL MESSAGES (Theme G1)
// ═══════════════════════════════════════════════════════════════

export function useEmailMessages(entityType?: string, entityId?: string) {
    const filtered = !!entityType && !!entityId;
    return useQuery({
        queryKey: ["email_messages", entityType ?? "all", entityId ?? "all"],
        queryFn: async () => {
            let q = fromTable("email_messages")
                .select("*")
                .order("received_at", { ascending: false });
            if (entityType) q = q.eq("entity_type", entityType);
            if (entityId) q = q.eq("entity_id", entityId);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
        enabled: filtered || (!entityType && !entityId),
    });
}

export function useCreateEmailMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (email: Record<string, unknown>) => {
            const { data, error } = await fromTable("email_messages")
                .insert(email)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["email_messages"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// SURVEY TEMPLATES & RESPONSES (Theme H3)
// ═══════════════════════════════════════════════════════════════

export function useSurveyTemplates(surveyType?: string) {
    return useQuery({
        queryKey: ["survey_templates", surveyType],
        queryFn: async () => {
            let q = fromTable("survey_templates")
                .select("*")
                .order("created_at", { ascending: false });
            if (surveyType) q = q.eq("survey_type", surveyType);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateSurveyTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (t: Record<string, unknown>) => {
            const { data, error } = await fromTable("survey_templates").insert(t).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["survey_templates"] }),
    });
}

export function useUpdateSurveyTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("survey_templates")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["survey_templates"] }),
    });
}

export function useSurveyResponses(templateId?: string, entityType?: string, entityId?: string) {
    return useQuery({
        queryKey: ["survey_responses", templateId, entityType, entityId],
        queryFn: async () => {
            let q = fromTable("survey_responses")
                .select("*, survey_templates(name, survey_type)")
                .order("submitted_at", { ascending: false });
            if (templateId) q = q.eq("template_id", templateId);
            if (entityType) q = q.eq("entity_type", entityType);
            if (entityId) q = q.eq("entity_id", entityId);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateSurveyResponse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (r: Record<string, unknown>) => {
            const { data, error } = await fromTable("survey_responses").insert(r).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["survey_responses"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// SLA POLICIES (Theme I1)
// ═══════════════════════════════════════════════════════════════

export function useSlaPolicies() {
    return useQuery({
        queryKey: ["sla_policies"],
        queryFn: async () => {
            const { data, error } = await fromTable("sla_policies").select("*").order("priority");
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateSlaPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p: Record<string, unknown>) => {
            const { data, error } = await fromTable("sla_policies").insert(p).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["sla_policies"] }),
    });
}

export function useSlaStatus() {
    return useQuery({
        queryKey: ["sla_status"],
        queryFn: async () => {
            const { data, error } = await fromTable("v_sla_status")
                .select("*")
                .order("sla_response_due_at", { ascending: true });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM FIELD DEFINITIONS & VALUES (Theme I2)
// ═══════════════════════════════════════════════════════════════

export interface CustomFieldDefinitionRow {
    id: string;
    name: string;
    field_key: string;
    field_type: string;
    entity_types: string[];
    is_required: boolean | null;
    is_filterable: boolean | null;
    options: unknown;
    default_value: string | null;
    display_order: number | null;
    section: string | null;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    organization_id: string | null;
}

export function useCustomFieldDefinitions(entityType?: string) {
    return useQuery({
        queryKey: ["custom_field_definitions", entityType],
        queryFn: async () => {
            let q = fromTable("custom_field_definitions").select("*").order("display_order");
            if (entityType) q = q.contains("entity_types", [entityType]);
            const { data, error } = await q;
            if (error) throw error;
            return (data ?? []) as CustomFieldDefinitionRow[];
        },
    });
}

export function useCreateCustomFieldDefinition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (def: Record<string, unknown>) => {
            const { data, error } = await fromTable("custom_field_definitions")
                .insert(def)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_field_definitions"] }),
    });
}

export function useUpdateCustomFieldDefinition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Record<string, unknown>) => {
            const { data, error } = await fromTable("custom_field_definitions")
                .update(updates)
                .eq("id", id as string)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_field_definitions"] }),
    });
}

export function useCustomFieldValues(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["custom_field_values", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("custom_field_values")
                .select("*, custom_field_definitions(name, field_key, field_type, options)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId);
            if (error) throw error;
            return data;
        },
        enabled: !!entityType && !!entityId,
    });
}

export function useUpsertCustomFieldValue() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (val: Record<string, unknown>) => {
            const { data, error } = await fromTable("custom_field_values")
                .upsert(val)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_field_values"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PROJECT TEMPLATES (Theme F3)
// ═══════════════════════════════════════════════════════════════

export function useProjectTemplates() {
    return useQuery({
        queryKey: ["project_templates"],
        queryFn: async () => {
            const { data, error } = await fromTable("project_templates")
                .select("*")
                .eq("is_active", true)
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateProjectTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (t: Record<string, unknown>) => {
            const { data, error } = await fromTable("project_templates")
                .insert(t)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["project_templates"] }),
    });
}

export function useUpdateProjectTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Record<string, unknown>) => {
            const { data, error } = await fromTable("project_templates")
                .update(updates)
                .eq("id", id as string)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["project_templates"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// AI REPORT QUERIES (Theme F2)
// ═══════════════════════════════════════════════════════════════

export function useAiReportQueries() {
    return useQuery({
        queryKey: ["ai_report_queries"],
        queryFn: async () => {
            const { data, error } = await fromTable("ai_report_queries")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateAiReportQuery() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (q: Record<string, unknown>) => {
            const { data, error } = await fromTable("ai_report_queries")
                .insert(q)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_report_queries"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// INVOICE GENERATION FROM TIME ENTRIES (Theme E2)
// ═══════════════════════════════════════════════════════════════

export function useGenerateInvoiceFromTime() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            projectId,
            timeEntryIds,
        }: {
            projectId: string;
            timeEntryIds: string[];
        }) => {
            // Fetch approved billable time entries
            const { data: entries, error: fetchError } = await fromTable("production_time_entries")
                .select("*")
                .in("id", timeEntryIds)
                .eq("billable", true)
                .is("invoice_line_item_id", null);
            if (fetchError) throw fetchError;
            if (!entries || (entries as unknown[]).length === 0)
                throw new Error("No billable uninvoiced entries found");

            const typedEntries = entries as unknown as Array<{
                id: string;
                regular_hours: number;
                overtime_hours: number;
                double_time_hours: number;
                total_pay: number;
                project_id: string;
                organization_id: string;
            }>;

            // Compute totals
            const totalHours = typedEntries.reduce(
                (s, e) => s + e.regular_hours + e.overtime_hours + e.double_time_hours,
                0
            );
            const totalAmount = typedEntries.reduce((s, e) => s + (e.total_pay || 0), 0);
            const organizationId = typedEntries[0]?.organization_id;
            if (!organizationId) {
                throw new Error("Missing organization context for selected time entries");
            }

            // Fetch project to resolve optional client company linkage
            const { data: project } = await fromTable("projects")
                .select("client_company_id")
                .eq("id", projectId)
                .maybeSingle();

            const invoiceDate = new Date();
            const dueDate = new Date(invoiceDate);
            dueDate.setDate(dueDate.getDate() + 30);
            const invoiceNumber = `TME-${invoiceDate.toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

            // Create client invoice (AR) for approved time entries
            const { data: invoice, error: invoiceError } = await fromTable("client_invoices")
                .insert({
                    project_id: projectId,
                    organization_id: organizationId,
                    company_id:
                        project && typeof project === "object" && "client_company_id" in project
                            ? (project as { client_company_id: string | null }).client_company_id
                            : null,
                    invoice_number: invoiceNumber,
                    invoice_date: invoiceDate.toISOString().slice(0, 10),
                    due_date: dueDate.toISOString().slice(0, 10),
                    subtotal: totalAmount,
                    total: totalAmount,
                    status: "draft",
                    notes: `Auto-generated from ${typedEntries.length} time entries (${totalHours.toFixed(1)}h)`,
                })
                .select()
                .single();
            if (invoiceError) throw invoiceError;

            const invoiceId = (invoice as unknown as { id: string }).id;

            // Create one consolidated line item for this batch of time
            const quantity = totalHours > 0 ? totalHours : 1;
            const unitPrice = totalHours > 0 ? totalAmount / totalHours : totalAmount;
            const { data: lineItem, error: lineItemError } = await fromTable("invoice_line_items")
                .insert({
                    client_invoice_id: invoiceId,
                    line_number: 1,
                    line_type: "time_and_materials",
                    name: "Labor",
                    description: `Generated from ${typedEntries.length} production time entries`,
                    quantity,
                    unit: "hour",
                    unit_price: unitPrice,
                    billing_period_start: invoiceDate.toISOString().slice(0, 10),
                    billing_period_end: invoiceDate.toISOString().slice(0, 10),
                })
                .select("id")
                .single();
            if (lineItemError) throw lineItemError;

            const lineItemId = (lineItem as unknown as { id: string }).id;

            // Link time entries to invoice
            const { error: linkError } = await fromTable("production_time_entries")
                .update({ invoice_line_item_id: lineItemId })
                .in("id", timeEntryIds);
            if (linkError) throw linkError;

            return invoice;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["production_time_entries"] });
            qc.invalidateQueries({ queryKey: ["client_invoices"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE DRIFT DETECTION (API-route backed)
// ═══════════════════════════════════════════════════════════════

export function useComplianceDrift(organizationId?: string) {
    return useQuery({
        queryKey: ["compliance_drift", organizationId],
        queryFn: async () => {
            const res = await fetch(
                `/api/settings/drift-detection?organization_id=${organizationId}`
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    (body as Record<string, string>).error || "Failed to load compliance data."
                );
            }
            return res.json();
        },
        enabled: !!organizationId,
    });
}

// ═══════════════════════════════════════════════════════════════
// ORG SECURITY SETTINGS (API-route backed)
// ═══════════════════════════════════════════════════════════════

export function useOrgSecuritySettings(organizationId?: string) {
    return useQuery({
        queryKey: ["org_security", organizationId],
        queryFn: async () => {
            const res = await fetch(`/api/organizations/${organizationId}/security`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    (body as Record<string, string>).error || "Failed to load security settings."
                );
            }
            const data = await res.json();
            return data.organization;
        },
        enabled: !!organizationId,
    });
}

export function useUpdateOrgSecuritySettings(organizationId?: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (updates: Record<string, unknown>) => {
            const res = await fetch(`/api/organizations/${organizationId}/security`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    (body as Record<string, string>).error || "Failed to save settings."
                );
            }
            const data = await res.json();
            return data.organization;
        },
        onSuccess: (data) => {
            qc.setQueryData(["org_security", organizationId], data);
        },
    });
}
