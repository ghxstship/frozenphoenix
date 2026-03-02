"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormLayout, FormSection } from "@/components/layouts/form-layout";
import { Input } from "@/components/ui/input";
import { CurrencyInput, DatePicker, FormField, Select } from "@/components/ui/form";
import { PROJECT_PHASES, PROJECT_STATUSES } from "@/config/domain-config";
import { isSupabaseConfigured, useCreateProject } from "@/lib/supabase/hooks";

export default function NewProjectPage() {
    const router = useRouter();
    const createProject = useCreateProject();

    const [formData, setFormData] = useState({
        name: "",
        client: "",
        status: "draft",
        currentPhase: "pre_production",
        startDate: "",
        endDate: "",
        budgetPlanned: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isSupabaseConfigured) {
                const projectData = {
                    name: formData.name,
                    client: formData.client,
                    status: formData.status,
                    current_phase: formData.currentPhase,
                    start_date: formData.startDate || null,
                    end_date: formData.endDate || null,
                    budget_planned: formData.budgetPlanned || null,
                };
                await createProject.mutateAsync(
                    projectData as unknown as Parameters<typeof createProject.mutateAsync>[0]
                );
            }
            router.push("/projects");
        } catch (error) {
            logger.error("Failed to create project", { error });
        }
    };

    const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }));
    const phaseOptions = PROJECT_PHASES.map((p) => ({ value: p.value, label: p.label }));

    const isValid =
        formData.name.trim() !== "" &&
        formData.client.trim() !== "" &&
        formData.startDate !== "" &&
        formData.endDate !== "";

    return (
        <FormLayout
            backHref="/projects"
            backLabel="Projects"
            title="New Project"
            description="Create a new project to track production work"
            onSubmit={handleSubmit}
            isSubmitting={createProject.isPending}
            isValid={isValid}
            submitLabel="Create Project"
        >
            <FormSection title="Basic Information" description="Core project details">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Project Name" htmlFor="name" required>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                        />
                    </FormField>
                    <FormField label="Client" htmlFor="client" required>
                        <Input
                            id="client"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            placeholder="Client name"
                        />
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Status" htmlFor="status">
                        <Select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statusOptions}
                        />
                    </FormField>
                    <FormField label="Starting Phase" htmlFor="phase">
                        <Select
                            id="phase"
                            value={formData.currentPhase}
                            onChange={(e) =>
                                setFormData({ ...formData, currentPhase: e.target.value })
                            }
                            options={phaseOptions}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Timeline" description="Project start and end dates">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Start Date" htmlFor="startDate" required>
                        <DatePicker
                            id="startDate"
                            value={formData.startDate}
                            onChange={(e) =>
                                setFormData({ ...formData, startDate: e.target.value })
                            }
                        />
                    </FormField>
                    <FormField label="End Date" htmlFor="endDate" required>
                        <DatePicker
                            id="endDate"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Budget" description="Planned budget for this project">
                <FormField
                    label="Planned Budget"
                    htmlFor="budget"
                    description="Total budget allocated for this project"
                >
                    <CurrencyInput
                        id="budget"
                        value={formData.budgetPlanned}
                        onChange={(value) =>
                            setFormData({ ...formData, budgetPlanned: value || 0 })
                        }
                        placeholder="0.00"
                    />
                </FormField>
            </FormSection>
        </FormLayout>
    );
}
