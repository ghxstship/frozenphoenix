"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormLayout, FormSection } from "@/components/layouts/form-layout";
import { Input } from "@/components/ui/input";
import { FormField, Select, DatePicker, CurrencyInput } from "@/components/ui/form";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { PROJECT_STATUSES, PROJECT_PHASES } from "@/config/domain-config";
import { FolderKanban } from "lucide-react";

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const project = MOCK_PROJECTS.find((p) => p.id === projectId);

    const [formData, setFormData] = useState({
        name: project?.name || "",
        client: project?.client || "",
        status: project?.status || "draft",
        currentPhase: project?.currentPhase || "pre_production",
        startDate: project?.startDate || "",
        endDate: project?.endDate || "",
        budgetPlanned: project?.budgetPlanned || 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!project) {
        return (
            <EmptyState
                icon={FolderKanban}
                title="Project not found"
                description="The project you're trying to edit doesn't exist."
                action={{ label: "Back to Projects", onClick: () => router.push("/projects") }}
            />
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In real app, call useUpdateProject mutation here
        console.log("Updating project:", formData);

        setIsSubmitting(false);
        router.push(`/projects/${projectId}`);
    };

    const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }));
    const phaseOptions = PROJECT_PHASES.map((p) => ({ value: p.value, label: p.label }));

    return (
        <FormLayout
            backHref={`/projects/${projectId}`}
            backLabel="Back to Project"
            title={`Edit ${project.name}`}
            description="Update project details and settings"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
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
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                            options={statusOptions}
                        />
                    </FormField>
                    <FormField label="Current Phase" htmlFor="phase">
                        <Select
                            id="phase"
                            value={formData.currentPhase}
                            onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value as typeof formData.currentPhase })}
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
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                <FormField label="Planned Budget" htmlFor="budget" description="Total budget allocated for this project">
                    <CurrencyInput
                        id="budget"
                        value={formData.budgetPlanned}
                        onChange={(value) => setFormData({ ...formData, budgetPlanned: value || 0 })}
                        placeholder="0.00"
                    />
                </FormField>
            </FormSection>
        </FormLayout>
    );
}
