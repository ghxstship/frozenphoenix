"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormPageShell } from "@/components/shells";
import { CONTRACT_TYPES, type ContractType } from "@/config/domain-config";
import { useCreateContract } from "@/lib/supabase";
import type { FormPageConfig } from "@/types/form-page-config";
import { Building2, Calendar, CheckCircle2, FileSignature } from "lucide-react";

export function NewContractPageClient() {
    const createContract = useCreateContract();
    const [selectedType, setSelectedType] = useState<ContractType | null>(null);

    const config: FormPageConfig = {
        entityKey: "contracts",
        title: "New Contract",
        description: "Create a new contract, NDA, SOW, or amendment",
        icon: FileSignature,
        backHref: "/contracts",
        backLabel: "Contracts",
        mode: "create",
        layout: "wizard",
        submitLabel: "Create Contract",
        successRedirect: "/contracts",
        transformSubmit: (data) => ({
            title: data.title || null,
            type: selectedType,
            counterparty_name: data.counterpartyName || null,
            value: data.value ? Number(data.value) : null,
            effective_date: data.effectiveDate || null,
            expiration_date: data.expirationDate || null,
            auto_renew: Boolean(data.autoRenew),
            description: data.description || null,
            status: "draft",
        }),
        steps: [
            {
                id: "type",
                label: "Contract Type",
                icon: FileSignature,
                canAdvance: () => !!selectedType,
                content: (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CONTRACT_TYPES.map((ct) => (
                            <Card
                                key={ct.value}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedType === ct.value ? "ring-2 ring-primary border-primary" : ""}`}
                                onClick={() => setSelectedType(ct.value)}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedType === ct.value ? "bg-primary/10" : "bg-secondary/50"}`}
                                        >
                                            <FileSignature
                                                className={`h-5 w-5 ${selectedType === ct.value ? "text-primary" : "text-muted-foreground"}`}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{ct.label}</p>
                                            <Badge variant={ct.variant} className="mt-1">
                                                {ct.value}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ),
            },
            {
                id: "details",
                label: "Details",
                icon: Building2,
                fields: [
                    {
                        id: "title",
                        label: "Contract Title",
                        type: "text",
                        placeholder: "e.g., Nike Master Services Agreement",
                        required: true,
                        fullWidth: true,
                    },
                    {
                        id: "counterpartyName",
                        label: "Counterparty Name",
                        type: "text",
                        placeholder: "e.g., Nike",
                        required: true,
                    },
                    {
                        id: "value",
                        label: "Contract Value",
                        type: "number",
                        placeholder: "0",
                    },
                    {
                        id: "description",
                        label: "Description",
                        type: "textarea",
                        placeholder: "Describe the scope and purpose of this contract...",
                        fullWidth: true,
                    },
                ],
            },
            {
                id: "terms",
                label: "Terms",
                icon: Calendar,
                fields: [
                    {
                        id: "effectiveDate",
                        label: "Effective Date",
                        type: "date",
                    },
                    {
                        id: "expirationDate",
                        label: "Expiration Date",
                        type: "date",
                    },
                    {
                        id: "autoRenew",
                        label: "Auto-Renewal",
                        type: "checkbox",
                        description: "Auto-renew upon expiration",
                        fullWidth: true,
                    },
                ],
            },
            {
                id: "review",
                label: "Review",
                icon: CheckCircle2,
                canAdvance: () => true,
                content: <ReviewStep selectedType={selectedType} />,
            },
        ],
    };

    const handleSubmit = async (data: Record<string, unknown>) => {
        await createContract.mutateAsync(
            data as unknown as Parameters<typeof createContract.mutateAsync>[0]
        );
    };

    return (
        <FormPageShell
            config={config}
            onSubmit={handleSubmit}
            isSubmitting={createContract.isPending}
        />
    );
}

/* ─── Review Step (reads form data via parent formData context) ─── */

function ReviewStep({ selectedType }: { selectedType: ContractType | null }) {
    const typeLabel = CONTRACT_TYPES.find((t) => t.value === selectedType)?.label ?? "—";
    return (
        <p className="text-sm text-muted-foreground">
            Creating a <strong>{typeLabel}</strong> contract. Complete all steps and click
            &quot;Create Contract&quot; to finish.
        </p>
    );
}
