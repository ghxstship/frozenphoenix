"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormLayout, FormSection } from "@/components/layouts/form-layout";
import { Input } from "@/components/ui/input";
import { FormField, Select, Textarea } from "@/components/ui/form";
import { useCreateVendor } from "@/lib/supabase/hooks";

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

export default function NewVendorPage() {
    const router = useRouter();
    const createVendor = useCreateVendor();

    const [formData, setFormData] = useState({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        specialty: "",
        status: "pending",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const vendorData = {
                name: formData.name,
                contact_name: formData.contactName || null,
                email: formData.email,
                phone: formData.phone || null,
                specialty: formData.specialty,
                status: formData.status,
                notes: formData.notes || null,
            };
            await createVendor.mutateAsync(
                vendorData as unknown as Parameters<typeof createVendor.mutateAsync>[0]
            );
            router.push("/vendors");
        } catch (error) {
            logger.error("Failed to create vendor", { error });
        }
    };

    const isValid =
        formData.name.trim() !== "" && formData.email.trim() !== "" && formData.specialty !== "";

    return (
        <FormLayout
            backHref="/vendors"
            backLabel="Vendors"
            title="Add Vendor"
            description="Add a new vendor to your network"
            onSubmit={handleSubmit}
            isSubmitting={createVendor.isPending}
            isValid={isValid}
            submitLabel="Add Vendor"
        >
            <FormSection title="Company Information" description="Basic vendor details">
                <FormField label="Company Name" htmlFor="name" required>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter company name"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Specialty" htmlFor="specialty" required>
                        <Select
                            id="specialty"
                            value={formData.specialty}
                            onChange={(e) =>
                                setFormData({ ...formData, specialty: e.target.value })
                            }
                            options={SPECIALTY_OPTIONS}
                            placeholder="Select specialty"
                        />
                    </FormField>
                    <FormField label="Status" htmlFor="status">
                        <Select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={STATUS_OPTIONS}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Contact Information" description="Primary contact details">
                <FormField label="Contact Name" htmlFor="contactName">
                    <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Primary contact name"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Email" htmlFor="email" required>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="vendor@example.com"
                        />
                    </FormField>
                    <FormField label="Phone" htmlFor="phone">
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Additional Information">
                <FormField
                    label="Notes"
                    htmlFor="notes"
                    description="Any additional notes about this vendor"
                >
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Enter any notes..."
                    />
                </FormField>
            </FormSection>
        </FormLayout>
    );
}
