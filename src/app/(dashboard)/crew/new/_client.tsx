"use client";

import { useMemo } from "react";
import { useCreateCrewMember } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells/form-page-shell";
import type { FormPageConfig } from "@/types/form-page-config";

const STATUS_OPTIONS = [
    { value: "available", label: "Available" },
    { value: "assigned", label: "Assigned" },
    { value: "on_leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
];

const ROLE_OPTIONS = [
    { value: "Lead Fabricator", label: "Lead Fabricator" },
    { value: "Fabricator", label: "Fabricator" },
    { value: "Rigger", label: "Rigger" },
    { value: "Electrician", label: "Electrician" },
    { value: "Carpenter", label: "Carpenter" },
    { value: "Welder", label: "Welder" },
    { value: "Painter", label: "Painter" },
    { value: "Driver", label: "Driver" },
    { value: "General Labor", label: "General Labor" },
];

const CONFIG: FormPageConfig = {
    entityKey: "crew",
    title: "Add Crew Member",
    description: "Add a new crew member to your team",
    backHref: "/crew",
    backLabel: "Crew",
    mode: "create",
    submitLabel: "Add Crew Member",
    sections: [
        {
            id: "personal",
            title: "Personal Information",
            description: "Basic contact details",
            fields: [
                {
                    id: "name",
                    label: "Full Name",
                    type: "text",
                    required: true,
                    placeholder: "Enter full name",
                    fullWidth: true,
                },
                {
                    id: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                    placeholder: "email@example.com",
                },
                { id: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567" },
            ],
        },
        {
            id: "employment",
            title: "Employment",
            description: "Role and compensation details",
            fields: [
                {
                    id: "role",
                    label: "Role",
                    type: "select",
                    required: true,
                    options: ROLE_OPTIONS,
                    placeholder: "Select role",
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: STATUS_OPTIONS,
                    defaultValue: "available",
                },
                {
                    id: "hourlyRate",
                    label: "Hourly Rate",
                    type: "currency",
                    description: "Standard hourly rate for this crew member",
                    placeholder: "0.00",
                    fullWidth: true,
                },
            ],
        },
    ],
    transformSubmit: (data) => ({
        name: data.name,
        email: data.email,
        phone: (data.phone as string) || null,
        role: data.role,
        hourly_rate: (data.hourlyRate as number) || null,
        status: data.status,
    }),
};

export function NewCrewMemberPageClient() {
    const createCrewMember = useCreateCrewMember();

    const handleSubmit = useMemo(
        () => async (data: Record<string, unknown>) => {
            await createCrewMember.mutateAsync(
                data as unknown as Parameters<typeof createCrewMember.mutateAsync>[0]
            );
        },
        [createCrewMember]
    );

    return (
        <FormPageShell
            config={CONFIG}
            onSubmit={handleSubmit}
            isSubmitting={createCrewMember.isPending}
        />
    );
}
