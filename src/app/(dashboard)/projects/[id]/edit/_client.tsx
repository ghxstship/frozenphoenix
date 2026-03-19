"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState } from "@/components/layouts/empty-state";
import { PROJECT_PHASES, PROJECT_STATUSES } from "@/config/domain-config";
import { useProject, useUpdateProject } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells/form-page-shell";
import type { FormPageConfig } from "@/types/form-page-config";
import { FolderKanban } from "lucide-react";

const STATUS_OPTIONS = PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }));
const PHASE_OPTIONS = PROJECT_PHASES.map((p) => ({ value: p.value, label: p.label }));

export function EditProjectPageClient() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const updateProject = useUpdateProject();
    const { data: project, isLoading } = useProject(projectId);

    const config = useMemo<FormPageConfig>(
        () => ({
            entityKey: "projects",
            title: `Edit ${(project as Record<string, unknown>)?.name ?? "Project"}`,
            description: "Update project details and settings",
            backHref: `/projects/${projectId}`,
            backLabel: "Back to Project",
            mode: "edit",
            recordId: projectId,
            sections: [
                {
                    id: "basic",
                    title: "Basic Information",
                    description: "Core project details",
                    fields: [
                        {
                            id: "name",
                            label: "Project Name",
                            type: "text",
                            required: true,
                            placeholder: "Enter project name",
                        },
                        {
                            id: "clientCompanyId",
                            label: "Client Company ID",
                            type: "text",
                            placeholder: "Client company UUID",
                        },
                        {
                            id: "status",
                            label: "Status",
                            type: "select",
                            options: STATUS_OPTIONS,
                            defaultValue: "draft",
                        },
                        {
                            id: "currentPhase",
                            label: "Current Phase",
                            type: "select",
                            options: PHASE_OPTIONS,
                            defaultValue: "pre_production",
                        },
                    ],
                },
                {
                    id: "timeline",
                    title: "Timeline",
                    description: "Project start and end dates",
                    fields: [
                        { id: "startDate", label: "Start Date", type: "date", required: true },
                        { id: "endDate", label: "End Date", type: "date", required: true },
                    ],
                },
                {
                    id: "budget",
                    title: "Budget",
                    description: "Planned budget for this project",
                    fields: [
                        {
                            id: "budgetPlanned",
                            label: "Planned Budget",
                            type: "currency",
                            description: "Total budget allocated for this project",
                            placeholder: "0.00",
                            fullWidth: true,
                        },
                    ],
                },
            ],
            transformRecord: (rec) => ({
                name: rec.name ?? "",
                clientCompanyId: rec.client_company_id ?? "",
                status: rec.status ?? "draft",
                currentPhase: (rec.current_phase as string) ?? "pre_production",
                startDate: (rec.start_date as string) ?? "",
                endDate: (rec.end_date as string) ?? "",
                budgetPlanned: (rec.budget_planned as number) ?? 0,
            }),
            transformSubmit: (data) => ({
                id: projectId,
                name: data.name,
                client_company_id: (data.clientCompanyId as string) || null,
                status: data.status,
                current_phase: data.currentPhase,
                start_date: (data.startDate as string) || null,
                end_date: (data.endDate as string) || null,
                budget_planned: (data.budgetPlanned as number) || null,
            }),
        }),
        [projectId, project]
    );

    const handleSubmit = useMemo(
        () => async (data: Record<string, unknown>) => {
            await updateProject.mutateAsync(
                data as unknown as Parameters<typeof updateProject.mutateAsync>[0]
            );
        },
        [updateProject]
    );

    if (!isLoading && !project) {
        return (
            <EmptyState
                icon={FolderKanban}
                title="Project not found"
                description="The project you're trying to edit doesn't exist."
                action={{ label: "Back to Projects", onClick: () => router.push("/projects") }}
            />
        );
    }

    return (
        <FormPageShell
            config={config}
            record={project as Record<string, unknown> | null}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            isSubmitting={updateProject.isPending}
        />
    );
}
