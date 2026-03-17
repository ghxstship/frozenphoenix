"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ═══════════════════════════════════════════════════════════════
// PROJECT COLLABORATORS — Hooks for the collaborator lifecycle (v2)
//
// Architecture: requirements-based model with portal_access_tokens.
// Collaborators do NOT get org_memberships — they access via scoped tokens.
// ═══════════════════════════════════════════════════════════════

// ─── Helpers ─────────────────────────────────────────────────

async function apiFetch<T = Record<string, unknown>>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            (err as Record<string, Record<string, string>>)?.error?.message ??
                `Request failed: ${res.status}`
        );
    }
    return res.json() as Promise<T>;
}

function jsonPost(url: string, data: unknown) {
    return apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

function jsonPatch(url: string, data: unknown) {
    return apiFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

// ─── Communication Templates ─────────────────────────────────

export function useProjectCommTemplates(projectId: string) {
    return useQuery({
        queryKey: ["project_comm_templates", projectId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>(
                `/api/projects/${projectId}/comm-templates`
            ).then((r) => r.data),
        enabled: !!projectId,
    });
}

export function useGenerateCommTemplates() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (projectId: string) =>
            apiFetch(`/api/projects/${projectId}/comm-templates`, { method: "POST" }),
        onSuccess: (_, projectId) => {
            qc.invalidateQueries({ queryKey: ["project_comm_templates", projectId] });
        },
    });
}

export function useUpdateCommTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            projectId,
            templateId,
            ...updates
        }: {
            projectId: string;
            templateId: string;
            [key: string]: unknown;
        }) => jsonPatch(`/api/projects/${projectId}/comm-templates/${templateId}`, updates),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ["project_comm_templates", v.projectId] });
        },
    });
}

// ─── Project Collaborators ───────────────────────────────────

export function useProjectCollaborators(projectId: string) {
    return useQuery({
        queryKey: ["project_collaborators", projectId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown>[] }>(
                `/api/projects/${projectId}/collaborators`
            ).then((r) => r.data),
        enabled: !!projectId,
    });
}

export function useProjectCollaborator(projectId: string, collabId: string) {
    return useQuery({
        queryKey: ["project_collaborators", projectId, collabId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown> }>(
                `/api/projects/${projectId}/collaborators/${collabId}`
            ).then((r) => r.data),
        enabled: !!projectId && !!collabId,
    });
}

export interface InviteCollaboratorPayload {
    projectId: string;
    vendor_id: string;
    engagement_type?: string;
    scope_summary?: string;
    notes?: string;
    requirements?: {
        requirement_type: string;
        label: string;
        description?: string;
        deadline?: string;
        is_blocking?: boolean;
        custom_instructions?: string;
    }[];
}

export function useInviteCollaborator() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, ...data }: InviteCollaboratorPayload) =>
            jsonPost(`/api/projects/${projectId}/collaborators`, data),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ["project_collaborators", v.projectId] });
        },
    });
}

export function useUpdateCollaborator() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            projectId,
            collabId,
            ...updates
        }: {
            projectId: string;
            collabId: string;
            [key: string]: unknown;
        }) => jsonPatch(`/api/projects/${projectId}/collaborators/${collabId}`, updates),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ["project_collaborators", v.projectId] });
            qc.invalidateQueries({ queryKey: ["project_collaborators", v.projectId, v.collabId] });
        },
    });
}

// ─── Collaborator Requirements ───────────────────────────────

export function useCollaboratorRequirements(projectId: string, collabId: string) {
    return useQuery({
        queryKey: ["collaborator_requirements", projectId, collabId],
        queryFn: () =>
            apiFetch<{ data: Record<string, unknown> }>(
                `/api/projects/${projectId}/collaborators/${collabId}`
            ).then((r) => {
                const reqs = (r.data as Record<string, unknown>).collaborator_requirements as
                    | Record<string, unknown>[]
                    | undefined;
                return reqs ?? [];
            }),
        enabled: !!projectId && !!collabId,
    });
}

// ─── Collaborator Actions ────────────────────────────────────

export function useIssueContract() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            projectId,
            collabId,
            ...data
        }: {
            projectId: string;
            collabId: string;
            title?: string;
            contract_type?: string;
            value?: number;
            effective_date?: string;
            expiration_date?: string;
            description?: string;
            contract_id?: string;
        }) => jsonPost(`/api/projects/${projectId}/collaborators/${collabId}/issue-contract`, data),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ["project_collaborators", v.projectId] });
        },
    });
}

export function useRequestCoi() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            projectId,
            collabId,
            ...data
        }: {
            projectId: string;
            collabId: string;
            coverage_minimum?: number;
            deadline?: string;
            notes?: string;
        }) => jsonPost(`/api/projects/${projectId}/collaborators/${collabId}/request-coi`, data),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ["project_collaborators", v.projectId] });
        },
    });
}

// ─── Crew Roster Submissions ─────────────────────────────────

export function useCrewSubmissions(projectId: string, collabId?: string) {
    return useQuery({
        queryKey: ["project_crew_submissions", projectId, collabId],
        queryFn: () => {
            const url = new URL(
                `/api/projects/${projectId}/crew-submissions`,
                window.location.origin
            );
            if (collabId) url.searchParams.set("collaborator_id", collabId);
            return apiFetch<{ data: Record<string, unknown>[] }>(url.toString()).then(
                (r) => r.data
            );
        },
        enabled: !!projectId,
    });
}
