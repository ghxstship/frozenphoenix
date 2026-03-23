/* ═══════════════════════════════════════════════════════════════
   APPROVAL ENGINE — React Query hooks for the approval engine API
   
   These hooks call the server-side approval engine API routes,
   NOT Supabase directly. The engine handles orchestration,
   step advancement, escalation, and cancellation.
   ═══════════════════════════════════════════════════════════════ */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────

interface InitiateParams {
    workflowId: string;
    entityId: string;
    entityType: string;
    entityName?: string | undefined;
    context?: Record<string, unknown> | undefined;
}

interface DecideParams {
    instanceId: string;
    stepId: string;
    decision: "approved" | "rejected" | "delegated";
    comments?: string | undefined;
    delegateTo?: string | undefined;
}

interface EscalateParams {
    instanceId: string;
    stepId: string;
    reason?: string | undefined;
}

interface CancelParams {
    instanceId: string;
    reason?: string | undefined;
}

interface InitiateResult {
    instanceId: string;
    currentStepId: string;
}

interface DecideResult {
    advanced: boolean;
    nextStepId?: string | undefined;
    instanceStatus: string;
}

interface EscalateResult {
    escalatedTo?: string | undefined;
}

interface InstanceStatusResult {
    instance: Record<string, unknown>;
    workflow: Record<string, unknown>;
    steps: Record<string, unknown>[];
    approvals: Record<string, unknown>[];
}

// ─── Fetch helper ────────────────────────────────────────────

async function engineFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json?.error?.message ?? `Request failed: ${res.status}`);
    }
    return json.data as T;
}

// ─── Queries ─────────────────────────────────────────────────

export function useApprovalInstanceStatus(instanceId: string | undefined) {
    return useQuery({
        queryKey: ["approval-engine", "status", instanceId],
        queryFn: () =>
            engineFetch<InstanceStatusResult>(`/api/approval-engine/status/${instanceId}`),
        enabled: !!instanceId,
    });
}

// ─── Mutations ───────────────────────────────────────────────

export function useInitiateApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: InitiateParams) =>
            engineFetch<InitiateResult>("/api/approval-engine/initiate", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
            queryClient.invalidateQueries({ queryKey: ["approval-engine"] });
        },
    });
}

export function useApprovalDecision() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: DecideParams) =>
            engineFetch<DecideResult>("/api/approval-engine/decide", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["approval-engine", "status", variables.instanceId],
            });
            queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
            queryClient.invalidateQueries({ queryKey: ["workflow_step_approvals"] });
        },
    });
}

export function useEscalateApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: EscalateParams) =>
            engineFetch<EscalateResult>("/api/approval-engine/escalate", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["approval-engine", "status", variables.instanceId],
            });
            queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
        },
    });
}

export function useCancelApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: CancelParams) =>
            engineFetch<{ success: boolean }>("/api/approval-engine/cancel", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["approval-engine", "status", variables.instanceId],
            });
            queryClient.invalidateQueries({ queryKey: ["workflow_instances"] });
        },
    });
}
