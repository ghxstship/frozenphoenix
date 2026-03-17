"use client";

import { useMemo } from "react";
import { PROJECT_PHASES, PROJECT_STATUSES } from "@/config/domain-config";
import { useCreateProject, useGenerateCommTemplates } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells/form-page-shell";
import type { FormPageConfig } from "@/types/form-page-config";

const STATUS_OPTIONS = PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }));
const PHASE_OPTIONS = PROJECT_PHASES.map((p) => ({ value: p.value, label: p.label }));

const CONFIG: FormPageConfig = {
    entityKey: "projects",
    title: "New Project",
    description: "Create a new project to track production work",
    backHref: "/projects",
    backLabel: "Projects",
    mode: "create",
    submitLabel: "Create Project",
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
                    id: "client",
                    label: "Client",
                    type: "text",
                    required: true,
                    placeholder: "Client name",
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
                    label: "Starting Phase",
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
    transformSubmit: (data) => ({
        name: data.name,
        client: data.client,
        status: data.status,
        current_phase: data.currentPhase,
        start_date: (data.startDate as string) || null,
        end_date: (data.endDate as string) || null,
        budget_planned: (data.budgetPlanned as number) || null,
    }),
};

export default function NewProjectPage() {
    const createProject = useCreateProject();
    const generateTemplates = useGenerateCommTemplates();

    const handleSubmit = useMemo(
        () => async (data: Record<string, unknown>) => {
            const result = await createProject.mutateAsync(
                data as unknown as Parameters<typeof createProject.mutateAsync>[0]
            );
            const projectId = (result as Record<string, unknown>)?.id as string | undefined;
            if (projectId) {
                generateTemplates.mutate(projectId);
            }
        },
        [createProject, generateTemplates]
    );

    return (
        <FormPageShell
            config={CONFIG}
            onSubmit={handleSubmit}
            isSubmitting={createProject.isPending}
        />
    );
}
