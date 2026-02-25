"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormLayout, FormSection } from "@/components/layouts/form-layout";
import { Input } from "@/components/ui/input";
import { FormField, Select, CurrencyInput } from "@/components/ui/form";

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

export default function NewCrewMemberPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        hourlyRate: 0,
        status: "available",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Creating crew member:", formData);

        setIsSubmitting(false);
        router.push("/crew");
    };

    const isValid = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.role !== "";

    return (
        <FormLayout
            backHref="/crew"
            backLabel="Crew"
            title="Add Crew Member"
            description="Add a new crew member to your team"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={isValid}
            submitLabel="Add Crew Member"
        >
            <FormSection title="Personal Information" description="Basic contact details">
                <FormField label="Full Name" htmlFor="name" required>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Email" htmlFor="email" required>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
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

            <FormSection title="Employment" description="Role and compensation details">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Role" htmlFor="role" required>
                        <Select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            options={ROLE_OPTIONS}
                            placeholder="Select role"
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

                <FormField label="Hourly Rate" htmlFor="hourlyRate" description="Standard hourly rate for this crew member">
                    <CurrencyInput
                        id="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={(value) => setFormData({ ...formData, hourlyRate: value || 0 })}
                        placeholder="0.00"
                    />
                </FormField>
            </FormSection>
        </FormLayout>
    );
}
