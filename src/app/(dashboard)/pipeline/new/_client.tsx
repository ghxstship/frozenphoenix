"use client";

import { useCreateDeal } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells";
import type { FormPageConfig } from "@/types/form-page-config";
import { Building2, Calendar, DollarSign, FileText, User } from "lucide-react";

const DEAL_STAGES = [
    { value: "lead", label: "Lead" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed_won", label: "Closed Won" },
    { value: "closed_lost", label: "Closed Lost" },
];

const PROJECT_TYPES = [
    { value: "brand_activation", label: "Brand Activation" },
    { value: "stage_set_design", label: "Stage & Set Design" },
    { value: "immersive_installation", label: "Immersive Installation" },
    { value: "trade_show_expo", label: "Trade Show / Expo" },
    { value: "pop_up_retail", label: "Pop-Up Retail" },
    { value: "festival_production", label: "Festival Production" },
    { value: "corporate_event", label: "Corporate Event" },
    { value: "product_launch", label: "Product Launch" },
];

const STAGE_PROBABILITIES: Record<string, number> = {
    lead: 10,
    qualified: 25,
    proposal: 50,
    negotiation: 75,
    closed_won: 100,
    closed_lost: 0,
};

const config: FormPageConfig = {
    entityKey: "deals",
    title: "New Deal",
    description: "Add a new opportunity to the pipeline",
    icon: FileText,
    backHref: "/pipeline",
    backLabel: "Pipeline",
    mode: "create",
    layout: "sections",
    submitLabel: "Create Deal",
    successRedirect: "/pipeline",
    transformSubmit: (data) => ({
        title: data.name || null,
        company: data.company || "Unknown",
        contact_name: data.contactName || "Unknown",
        contact_email: data.contactEmail || "unknown@example.com",
        value: data.value ? Number(data.value) : 0,
        stage: data.stage || "lead",
        probability: STAGE_PROBABILITIES[String(data.stage ?? "lead")] ?? 25,
        expected_close_date: data.expectedCloseDate || null,
        notes: data.description || null,
    }),
    sections: [
        {
            id: "deal-info",
            title: "Deal Information",
            fields: [
                {
                    id: "name",
                    label: "Deal Name",
                    type: "text",
                    placeholder: "e.g., TechCorp Product Launch 2026",
                    required: true,
                    fullWidth: true,
                    icon: FileText,
                },
                {
                    id: "projectType",
                    label: "Project Type",
                    type: "select",
                    options: PROJECT_TYPES,
                    placeholder: "Select type...",
                },
                {
                    id: "stage",
                    label: "Stage",
                    type: "select",
                    options: DEAL_STAGES,
                    defaultValue: "lead",
                },
                {
                    id: "description",
                    label: "Description",
                    type: "textarea",
                    placeholder: "Brief description of the opportunity...",
                    fullWidth: true,
                },
            ],
        },
        {
            id: "contact-info",
            title: "Contact Information",
            fields: [
                {
                    id: "company",
                    label: "Company",
                    type: "text",
                    placeholder: "Company name",
                    icon: Building2,
                },
                {
                    id: "contactName",
                    label: "Contact Name",
                    type: "text",
                    placeholder: "Primary contact",
                    icon: User,
                },
                {
                    id: "contactEmail",
                    label: "Email",
                    type: "email",
                    placeholder: "contact@company.com",
                },
                {
                    id: "contactPhone",
                    label: "Phone",
                    type: "tel",
                    placeholder: "+1 (555) 000-0000",
                },
            ],
        },
        {
            id: "financials",
            title: "Deal Value & Timeline",
            fields: [
                {
                    id: "value",
                    label: "Deal Value",
                    type: "currency",
                    placeholder: "0",
                    icon: DollarSign,
                },
                {
                    id: "expectedCloseDate",
                    label: "Expected Close",
                    type: "date",
                    icon: Calendar,
                },
            ],
        },
        {
            id: "next-steps",
            title: "Next Steps",
            fields: [
                {
                    id: "nextStep",
                    label: "Next Action",
                    type: "text",
                    placeholder: "e.g., Schedule discovery call",
                    fullWidth: true,
                },
                {
                    id: "nextStepDate",
                    label: "Due Date",
                    type: "date",
                    icon: Calendar,
                },
            ],
        },
    ],
};

export function NewPipelinePageClient() {
    const createDeal = useCreateDeal();

    const handleSubmit = async (data: Record<string, unknown>) => {
        await createDeal.mutateAsync(
            data as unknown as Parameters<typeof createDeal.mutateAsync>[0]
        );
    };

    return (
        <FormPageShell
            config={config}
            onSubmit={handleSubmit}
            isSubmitting={createDeal.isPending}
        />
    );
}
