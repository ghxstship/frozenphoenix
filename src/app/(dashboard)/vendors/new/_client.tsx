"use client";

import { useMemo } from "react";
import { useCreateVendor } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells/form-page-shell";
import type { FormPageConfig } from "@/types/form-page-config";

const SPECIALTY_OPTIONS = [
    { value: "Fabrication", label: "Fabrication" },
    { value: "Printing", label: "Printing" },
    { value: "Rigging", label: "Rigging" },
    { value: "AV Equipment", label: "AV Equipment" },
    { value: "Lighting", label: "Lighting" },
    { value: "Trucking", label: "Trucking" },
    { value: "Catering", label: "Catering" },
    { value: "Security", label: "Security" },
    { value: "Staffing", label: "Staffing" },
    { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending Approval" },
];

const CONFIG: FormPageConfig = {
    entityKey: "vendors",
    title: "Add Vendor",
    description: "Add a new vendor to your network",
    backHref: "/vendors",
    backLabel: "Vendors",
    mode: "create",
    submitLabel: "Add Vendor",
    sections: [
        {
            id: "company",
            title: "Company Information",
            description: "Basic vendor details",
            fields: [
                {
                    id: "name",
                    label: "Company Name",
                    type: "text",
                    required: true,
                    placeholder: "Enter company name",
                    fullWidth: true,
                },
                {
                    id: "specialty",
                    label: "Specialty",
                    type: "select",
                    required: true,
                    options: SPECIALTY_OPTIONS,
                    placeholder: "Select specialty",
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: STATUS_OPTIONS,
                    defaultValue: "pending",
                },
            ],
        },
        {
            id: "contact",
            title: "Contact Information",
            description: "Primary contact details",
            fields: [
                {
                    id: "contactName",
                    label: "Contact Name",
                    type: "text",
                    placeholder: "Primary contact name",
                    fullWidth: true,
                },
                {
                    id: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                    placeholder: "vendor@example.com",
                },
                { id: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567" },
            ],
        },
        {
            id: "additional",
            title: "Additional Information",
            fields: [
                {
                    id: "notes",
                    label: "Notes",
                    type: "textarea",
                    description: "Any additional notes about this vendor",
                    placeholder: "Enter any notes...",
                    fullWidth: true,
                },
            ],
        },
    ],
    transformSubmit: (data) => ({
        name: data.name,
        contact_name: (data.contactName as string) || null,
        email: data.email,
        phone: (data.phone as string) || null,
        specialty: data.specialty,
        status: data.status,
        notes: (data.notes as string) || null,
    }),
};

export function NewVendorPageClient() {
    const createVendor = useCreateVendor();

    const handleSubmit = useMemo(
        () => async (data: Record<string, unknown>) => {
            await createVendor.mutateAsync(
                data as unknown as Parameters<typeof createVendor.mutateAsync>[0]
            );
        },
        [createVendor]
    );

    return (
        <FormPageShell
            config={CONFIG}
            onSubmit={handleSubmit}
            isSubmitting={createVendor.isPending}
        />
    );
}
