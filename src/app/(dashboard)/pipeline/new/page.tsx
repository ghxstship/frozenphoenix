"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, useCreateDeal } from "@/lib/supabase/hooks";
import {
    ArrowLeft,
    Building2,
    Calendar,
    DollarSign,
    FileText,
    Loader2,
    Save,
    User,
} from "lucide-react";

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

export default function NewDealPage() {
    const router = useRouter();
    const createDeal = useCreateDeal();

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        value: "",
        stage: "lead",
        probability: "25",
        projectType: "",
        expectedCloseDate: "",
        description: "",
        nextStep: "",
        nextStepDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isSupabaseConfigured) {
                const dealData = {
                    title: formData.name,
                    company: formData.company || "Unknown",
                    contact_name: formData.contactName || "Unknown",
                    contact_email: formData.contactEmail || "unknown@example.com",
                    value: formData.value ? parseFloat(formData.value) : 0,
                    stage: formData.stage as
                        | "lead"
                        | "qualified"
                        | "proposal"
                        | "negotiation"
                        | "won"
                        | "lost",
                    probability: parseInt(formData.probability),
                    expected_close_date: formData.expectedCloseDate || null,
                    notes: formData.description || null,
                };
                await createDeal.mutateAsync(
                    dealData as unknown as Parameters<typeof createDeal.mutateAsync>[0]
                );
            }
            router.push("/pipeline");
        } catch (error) {
            logger.error("Failed to create deal", { error });
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (field === "stage") {
            const probabilities: Record<string, string> = {
                lead: "10",
                qualified: "25",
                proposal: "50",
                negotiation: "75",
                closed_won: "100",
                closed_lost: "0",
            };
            setFormData((prev) => ({ ...prev, probability: probabilities[value] || "25" }));
        }
    };

    return (
        <PageShell
            title="New Deal"
            description="Add a new opportunity to the pipeline"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createDeal.isPending || !formData.name}
                    >
                        {createDeal.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {createDeal.isPending ? "Saving..." : "Create Deal"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Deal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Deal Name *</label>
                            <Input
                                placeholder="e.g., TechCorp Product Launch 2026"
                                value={formData.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Project Type
                                </label>
                                <select
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
                                    value={formData.projectType}
                                    onChange={(e) => updateField("projectType", e.target.value)}
                                >
                                    <option value="">Select type...</option>
                                    {PROJECT_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Stage</label>
                                <select
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
                                    value={formData.stage}
                                    onChange={(e) => updateField("stage", e.target.value)}
                                >
                                    {DEAL_STAGES.map((stage) => (
                                        <option key={stage.value} value={stage.value}>
                                            {stage.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                                placeholder="Brief description of the opportunity..."
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Company</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Company name"
                                        value={formData.company}
                                        onChange={(e) => updateField("company", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Contact Name
                                </label>
                                <Input
                                    placeholder="Primary contact"
                                    value={formData.contactName}
                                    onChange={(e) => updateField("contactName", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                <Input
                                    type="email"
                                    placeholder="contact@company.com"
                                    value={formData.contactEmail}
                                    onChange={(e) => updateField("contactEmail", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                                <Input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.contactPhone}
                                    onChange={(e) => updateField("contactPhone", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financials */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Deal Value & Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Deal Value
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        placeholder="0"
                                        value={formData.value}
                                        onChange={(e) => updateField("value", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Probability (%)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.probability}
                                    onChange={(e) => updateField("probability", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Expected Close
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={formData.expectedCloseDate}
                                        onChange={(e) =>
                                            updateField("expectedCloseDate", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Weighted Value
                                </span>
                                <span className="text-lg font-bold">
                                    $
                                    {formData.value
                                        ? (
                                              parseFloat(formData.value) *
                                              (parseInt(formData.probability) / 100)
                                          ).toLocaleString()
                                        : "0"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Next Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1.5 block">
                                    Next Action
                                </label>
                                <Input
                                    placeholder="e.g., Schedule discovery call"
                                    value={formData.nextStep}
                                    onChange={(e) => updateField("nextStep", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Due Date</label>
                                <Input
                                    type="date"
                                    value={formData.nextStepDate}
                                    onChange={(e) => updateField("nextStepDate", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createDeal.isPending || !formData.name}>
                        {createDeal.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Create Deal
                    </Button>
                </div>
            </form>
        </PageShell>
    );
}
