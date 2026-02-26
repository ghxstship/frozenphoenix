"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormLayout, FormSection } from "@/components/layouts/form-layout";
import { Input } from "@/components/ui/input";
import { FormField, Select, CurrencyInput, Textarea } from "@/components/ui/form";
import { useCreateAsset, isSupabaseConfigured } from "@/lib/supabase/hooks";

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

export default function NewAssetPage() {
    const router = useRouter();
    const createAsset = useCreateAsset();

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        barcode: "",
        location: "",
        condition: "good",
        ownedOrRental: "owned",
        purchasePrice: 0,
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isSupabaseConfigured) {
                const assetData = {
                    name: formData.name,
                    category: formData.category,
                    barcode: formData.barcode || null,
                    location: formData.location || null,
                    condition: formData.condition,
                    owned_or_rental: formData.ownedOrRental,
                    purchase_price: formData.purchasePrice || null,
                    notes: formData.notes || null,
                    status: "available",
                };
                await createAsset.mutateAsync(assetData as unknown as Parameters<typeof createAsset.mutateAsync>[0]);
            }
            router.push("/assets");
        } catch (error) {
            console.error("Failed to create asset:", error);
        }
    };

    const isValid = formData.name.trim() !== "" && formData.category !== "";

    return (
        <FormLayout
            backHref="/assets"
            backLabel="Assets"
            title="Add Asset"
            description="Add a new asset to your inventory"
            onSubmit={handleSubmit}
            isSubmitting={createAsset.isPending}
            isValid={isValid}
            submitLabel="Add Asset"
        >
            <FormSection title="Asset Information" description="Basic asset details">
                <FormField label="Asset Name" htmlFor="name" required>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter asset name"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Category" htmlFor="category" required>
                        <Select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            options={CATEGORY_OPTIONS}
                            placeholder="Select category"
                        />
                    </FormField>
                    <FormField label="Barcode/Serial" htmlFor="barcode">
                        <Input
                            id="barcode"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="Enter barcode or serial number"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Status & Location" description="Current status and location">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Condition" htmlFor="condition">
                        <Select
                            id="condition"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            options={CONDITION_OPTIONS}
                        />
                    </FormField>
                    <FormField label="Ownership" htmlFor="ownership">
                        <Select
                            id="ownership"
                            value={formData.ownedOrRental}
                            onChange={(e) => setFormData({ ...formData, ownedOrRental: e.target.value })}
                            options={OWNERSHIP_OPTIONS}
                        />
                    </FormField>
                </div>

                <FormField label="Location" htmlFor="location" description="Current storage or deployment location">
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Warehouse A, Bay 3"
                    />
                </FormField>
            </FormSection>

            <FormSection title="Financial" description="Purchase and value information">
                <FormField label="Purchase Price" htmlFor="purchasePrice" description="Original purchase price (if owned)">
                    <CurrencyInput
                        id="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={(value) => setFormData({ ...formData, purchasePrice: value || 0 })}
                        placeholder="0.00"
                    />
                </FormField>
            </FormSection>

            <FormSection title="Additional Information">
                <FormField label="Notes" htmlFor="notes">
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional notes about this asset..."
                    />
                </FormField>
            </FormSection>
        </FormLayout>
    );
}
