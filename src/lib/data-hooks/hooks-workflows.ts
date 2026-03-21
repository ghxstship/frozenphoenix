"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/generated/database.types";

type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { user_profiles: { display_name: string } | null };
type ProjectName = { projects: { name: string } | null };
// VendorName available if needed for future joins
type LocationName = { locations: { name: string } | null };
type EventName = { events: { name: string } | null };

// ─── Join-aware types ───
export type CallSheetWithJoins = WithJoin<
    Tables<"call_sheets">,
    ProjectName & LocationName & EventName
>;
export type CallSheetCrewWithJoins = WithJoin<
    Tables<"call_sheet_crew">,
    { crew_members: { name: string; email: string; phone: string } | null }
>;
export type TechSheetWithJoins = WithJoin<
    Tables<"tech_sheets">,
    ProjectName & LocationName & EventName
>;
export type ApprovalWorkflowRow = Tables<"approval_workflows">;
export type ApprovalStepRow = Tables<"approval_steps">;
export type WorkflowInstanceWithJoins = WithJoin<
    Tables<"workflow_instances">,
    { approval_workflows: { name: string } | null } & ProfileName
>;
export type WorkflowStepApprovalWithJoins = WithJoin<
    Tables<"workflow_step_approvals">,
    ProfileName & { approval_steps: { name: string; step_order: number } | null }
>;
export type ESignatureRow = Tables<"e_signatures">;
export type NotificationPreferencesRow = Tables<"notification_preferences">;

// ═══════════════════════════════════════════════════════════════
// CALL SHEETS
// ═══════════════════════════════════════════════════════════════

export function useCallSheets(projectId?: string) {
    return useQuery({
        queryKey: ["call_sheets", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("call_sheets")
                .select("*, projects(name), locations(name), events(name)")
                .order("date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as CallSheetWithJoins[];
        },
    });
}

export function useCallSheet(id: string) {
    return useQuery({
        queryKey: ["call_sheets", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("call_sheets")
                .select("*, projects(name), locations(name), events(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as CallSheetWithJoins;
        },
        enabled: !!id,
    });
}

export function useCreateCallSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cs: TablesInsert<"call_sheets">) => {
            const { data, error } = await getSupabase()
                .from("call_sheets")
                .insert(cs)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"call_sheets">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["call_sheets"] }),
    });
}

export function useUpdateCallSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"call_sheets"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("call_sheets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"call_sheets">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["call_sheets"] });
            queryClient.invalidateQueries({ queryKey: ["call_sheets", variables.id] });
        },
    });
}

export function useDeleteCallSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("call_sheets")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["call_sheets"] }),
    });
}

export function useCallSheetCrew(callSheetId: string) {
    return useQuery({
        queryKey: ["call_sheet_crew", callSheetId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("call_sheet_crew")
                .select("*, crew_members(name, email, phone)")
                .eq("call_sheet_id", callSheetId)
                .order("display_order");
            if (error) throw error;
            return data as unknown as CallSheetCrewWithJoins[];
        },
        enabled: !!callSheetId,
    });
}

// ═══════════════════════════════════════════════════════════════
// TECH SHEETS
// ═══════════════════════════════════════════════════════════════

export function useTechSheets(projectId?: string) {
    return useQuery({
        queryKey: ["tech_sheets", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("tech_sheets")
                .select("*, projects(name), locations(name), events(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as TechSheetWithJoins[];
        },
    });
}

export function useTechSheet(id: string) {
    return useQuery({
        queryKey: ["tech_sheets", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("tech_sheets")
                .select("*, projects(name), locations(name), events(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as TechSheetWithJoins;
        },
        enabled: !!id,
    });
}

export function useCreateTechSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ts: TablesInsert<"tech_sheets">) => {
            const { data, error } = await getSupabase()
                .from("tech_sheets")
                .insert(ts)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"tech_sheets">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tech_sheets"] }),
    });
}

export function useUpdateTechSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"tech_sheets"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("tech_sheets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"tech_sheets">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["tech_sheets"] });
            queryClient.invalidateQueries({ queryKey: ["tech_sheets", variables.id] });
        },
    });
}

export function useDeleteTechSheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("tech_sheets")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tech_sheets"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// APPROVAL WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export function useApprovalWorkflows() {
    return useQuery({
        queryKey: ["approval_workflows"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("approval_workflows")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as ApprovalWorkflowRow[];
        },
    });
}

export function useApprovalWorkflow(id: string) {
    return useQuery({
        queryKey: ["approval_workflows", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("approval_workflows")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as ApprovalWorkflowRow;
        },
        enabled: !!id,
    });
}

export function useCreateApprovalWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (wf: TablesInsert<"approval_workflows">) => {
            const { data, error } = await getSupabase()
                .from("approval_workflows")
                .insert(wf)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ApprovalWorkflowRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approval_workflows"] }),
    });
}

export function useUpdateApprovalWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"approval_workflows"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("approval_workflows")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ApprovalWorkflowRow;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["approval_workflows"] });
            queryClient.invalidateQueries({ queryKey: ["approval_workflows", variables.id] });
        },
    });
}

// ─── Approval Steps ───
export function useApprovalSteps(workflowId: string) {
    return useQuery({
        queryKey: ["approval_steps", workflowId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("approval_steps")
                .select("*")
                .eq("workflow_id", workflowId)
                .order("step_order");
            if (error) throw error;
            return data as unknown as ApprovalStepRow[];
        },
        enabled: !!workflowId,
    });
}

export function useCreateApprovalStep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (step: TablesInsert<"approval_steps">) => {
            const { data, error } = await getSupabase()
                .from("approval_steps")
                .insert(step)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ApprovalStepRow;
        },
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({ queryKey: ["approval_steps", variables.workflow_id] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW INSTANCES
// ═══════════════════════════════════════════════════════════════

export function useWorkflowInstances(entityType?: string, entityId?: string) {
    return useQuery({
        queryKey: ["workflow_instances", entityType, entityId],
        queryFn: async () => {
            let query = getSupabase()
                .from("workflow_instances")
                .select("*, approval_workflows(name), user_profiles(display_name)")
                .order("created_at", { ascending: false });
            if (entityType) query = query.eq("entity_type", entityType);
            if (entityId) query = query.eq("entity_id", entityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as WorkflowInstanceWithJoins[];
        },
    });
}

export function useCreateWorkflowInstance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (instance: TablesInsert<"workflow_instances">) => {
            const { data, error } = await getSupabase()
                .from("workflow_instances")
                .insert(instance)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"workflow_instances">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflow_instances"] }),
    });
}

export function useUpdateWorkflowInstance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"workflow_instances"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("workflow_instances")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"workflow_instances">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflow_instances"] }),
    });
}

// ─── Step Approvals ───
export function useWorkflowStepApprovals(instanceId: string) {
    return useQuery({
        queryKey: ["workflow_step_approvals", instanceId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("workflow_step_approvals")
                .select("*, user_profiles(display_name), approval_steps(name, step_order)")
                .eq("instance_id", instanceId)
                .order("assigned_at");
            if (error) throw error;
            return data as unknown as WorkflowStepApprovalWithJoins[];
        },
        enabled: !!instanceId,
    });
}

// ═══════════════════════════════════════════════════════════════
// E-SIGNATURES
// ═══════════════════════════════════════════════════════════════

export function useESignatures(entityType?: string, entityId?: string) {
    return useQuery({
        queryKey: ["e_signatures", entityType, entityId],
        queryFn: async () => {
            let query = getSupabase()
                .from("e_signatures")
                .select("*")
                .order("created_at", { ascending: false });
            if (entityType) query = query.eq("entity_type", entityType);
            if (entityId) query = query.eq("entity_id", entityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ESignatureRow[];
        },
    });
}

export function useCreateESignature() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sig: TablesInsert<"e_signatures">) => {
            const { data, error } = await getSupabase()
                .from("e_signatures")
                .insert(sig)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as ESignatureRow;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["e_signatures"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION PREFERENCES
// ═══════════════════════════════════════════════════════════════

export function useNotificationPreferences(userId: string) {
    return useQuery({
        queryKey: ["notification_preferences", userId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("notification_preferences")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();
            if (error) throw error;
            return data as unknown as NotificationPreferencesRow | null;
        },
        enabled: !!userId,
    });
}

export function useUpsertNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (prefs: TablesInsert<"notification_preferences">) => {
            const { data, error } = await getSupabase()
                .from("notification_preferences")
                .upsert(prefs, { onConflict: "user_id" })
                .select()
                .single();
            if (error) throw error;
            return data as unknown as NotificationPreferencesRow;
        },
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["notification_preferences", variables.user_id],
            }),
    });
}
