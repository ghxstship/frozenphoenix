"use client";

import { useMemo } from "react";
import { useCreateAsset } from "@/lib/supabase";
import { FormPageShell } from "@/components/shells/form-page-shell";
import type { FormPageConfig } from "@/types/form-page-config";

const CATEGORY_OPTIONS = [
    { value: "Tools", label: "Tools" },
    { value: "Equipment", label: "Equipment" },
    { value: "Staging", label: "Staging" },
    { value: "Lighting", label: "Lighting" },
    { value: "Audio", label: "Audio" },
    { value: "Video", label: "Video" },
    { value: "Rigging", label: "Rigging" },
    { value: "Furniture", label: "Furniture" },
    { value: "Decor", label: "Decor" },
    { value: "Other", label: "Other" },
];

const CONDITION_OPTIONS = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "needs_repair", label: "Needs Repair" },
];

const OWNERSHIP_OPTIONS = [
    { value: "owned", label: "Owned" },
    { value: "rental", label: "Rental" },
];

const CONFIG: FormPageConfig = {
    entityKey: "assets",
    title: "Add Asset",
    description: "Add a new asset to your inventory",
    backHref: "/assets",
    backLabel: "Assets",
    mode: "create",
    submitLabel: "Add Asset",
    sections: [
        {
            id: "info",
            title: "Asset Information",
            description: "Basic asset details",
            fields: [
                {
                    id: "name",
                    label: "Asset Name",
                    type: "text",
                    required: true,
                    placeholder: "Enter asset name",
                    fullWidth: true,
                },
                {
                    id: "category",
                    label: "Category",
                    type: "select",
                    required: true,
                    options: CATEGORY_OPTIONS,
                    placeholder: "Select category",
                },
                {
                    id: "barcode",
                    label: "Barcode/Serial",
                    type: "text",
                    placeholder: "Enter barcode or serial number",
                },
            ],
        },
        {
            id: "status",
            title: "Status & Location",
            description: "Current status and location",
            fields: [
                {
                    id: "condition",
                    label: "Condition",
                    type: "select",
                    options: CONDITION_OPTIONS,
                    defaultValue: "good",
                },
                {
                    id: "ownedOrRental",
                    label: "Ownership",
                    type: "select",
                    options: OWNERSHIP_OPTIONS,
                    defaultValue: "owned",
                },
                {
                    id: "location",
                    label: "Location",
                    type: "text",
                    placeholder: "e.g., Warehouse A, Bay 3",
                    description: "Current storage or deployment location",
                    fullWidth: true,
                },
            ],
        },
        {
            id: "financial",
            title: "Financial",
            description: "Purchase and value information",
            fields: [
                {
                    id: "purchasePrice",
                    label: "Purchase Price",
                    type: "currency",
                    description: "Original purchase price (if owned)",
                    placeholder: "0.00",
                    fullWidth: true,
                },
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
                    placeholder: "Any additional notes about this asset...",
                    fullWidth: true,
                },
            ],
        },
    ],
    transformSubmit: (data) => ({
        name: data.name,
        category: data.category,
        barcode: (data.barcode as string) || null,
        location: (data.location as string) || null,
        condition: data.condition,
        owned_or_rental: data.ownedOrRental,
        purchase_price: (data.purchasePrice as number) || null,
        notes: (data.notes as string) || null,
        status: "available",
    }),
};

export default function NewAssetPage() {
    const createAsset = useCreateAsset();

    const handleSubmit = useMemo(
        () => async (data: Record<string, unknown>) => {
            await createAsset.mutateAsync(
                data as unknown as Parameters<typeof createAsset.mutateAsync>[0]
            );
        },
        [createAsset]
    );

    return (
        <FormPageShell
            config={CONFIG}
            onSubmit={handleSubmit}
            isSubmitting={createAsset.isPending}
        />
    );
}
