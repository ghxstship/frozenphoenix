"use client";

import { logger } from "@/lib/logger";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_TYPES, type ContractType } from "@/config/domain-config";
import { useCreateContract } from "@/lib/supabase/hooks";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    CheckCircle2,
    FileSignature,
    Loader2,
} from "lucide-react";

type WizardStep = "type" | "details" | "terms" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ElementType }[] = [
    { key: "type", label: "Contract Type", icon: FileSignature },
    { key: "details", label: "Details", icon: Building2 },
    { key: "terms", label: "Terms", icon: Calendar },
    { key: "review", label: "Review", icon: CheckCircle2 },
];

export default function NewContractPage() {
    const router = useRouter();
    const createContract = useCreateContract();
    const [currentStep, setCurrentStep] = useState<WizardStep>("type");
    const [selectedType, setSelectedType] = useState<ContractType | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        counterpartyName: "",
        value: "",
        effectiveDate: "",
        expirationDate: "",
        autoRenew: false,
        description: "",
    });

    const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
    const canNext =
        currentStep === "type"
            ? !!selectedType
            : currentStep === "details"
              ? !!formData.title && !!formData.counterpartyName
              : true;

    const goNext = () => {
        const idx = currentStepIndex + 1;
        const step = STEPS[idx];
        if (idx < STEPS.length && step) setCurrentStep(step.key);
    };
    const goBack = () => {
        const idx = currentStepIndex - 1;
        const step = STEPS[idx];
        if (idx >= 0 && step) setCurrentStep(step.key);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <PageHeader
                title="New Contract"
                description="Create a new contract, NDA, SOW, or amendment"
            >
                <Link href="/contracts">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </Link>
            </PageHeader>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = step.key === currentStep;
                    const isComplete = i < currentStepIndex;
                    return (
                        <div key={step.key} className="flex items-center gap-2 flex-1">
                            <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${isComplete ? "bg-success text-success-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                            >
                                {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                {step.label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 ${isComplete ? "bg-success" : "bg-muted"}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Contract Type */}
            {currentStep === "type" && (
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
            )}

            {/* Step 2: Details */}
            {currentStep === "details" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Contract Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Contract Title</label>
                            <Input
                                placeholder="e.g., Nike Master Services Agreement"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Counterparty Name
                            </label>
                            <Input
                                placeholder="e.g., Nike"
                                value={formData.counterpartyName}
                                onChange={(e) =>
                                    setFormData({ ...formData, counterpartyName: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Contract Value</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.value}
                                onChange={(e) =>
                                    setFormData({ ...formData, value: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <textarea
                                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                                placeholder="Describe the scope and purpose of this contract..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Terms */}
            {currentStep === "terms" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Contract Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Effective Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.effectiveDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, effectiveDate: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Expiration Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.expirationDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, expirationDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="autoRenew"
                                checked={formData.autoRenew}
                                onChange={(e) =>
                                    setFormData({ ...formData, autoRenew: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-input"
                            />
                            <label htmlFor="autoRenew" className="text-sm font-medium">
                                Auto-renew upon expiration
                            </label>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Review Contract</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="text-sm font-semibold">
                                        {
                                            CONTRACT_TYPES.find((t) => t.value === selectedType)
                                                ?.label
                                        }
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground">Counterparty</p>
                                    <p className="text-sm font-semibold">
                                        {formData.counterpartyName || "—"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground">Value</p>
                                    <p className="text-sm font-semibold">
                                        {formData.value
                                            ? `$${Number(formData.value).toLocaleString()}`
                                            : "—"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground">Period</p>
                                    <p className="text-sm font-semibold">
                                        {formData.effectiveDate || "—"} →{" "}
                                        {formData.expirationDate || "—"}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/30">
                                <p className="text-xs text-muted-foreground">Title</p>
                                <p className="text-sm font-semibold">{formData.title || "—"}</p>
                            </div>
                            {formData.description && (
                                <div className="p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground">Description</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={goBack} disabled={currentStepIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {currentStep === "review" ? (
                    <Button
                        disabled={!canNext || createContract.isPending}
                        onClick={async () => {
                            try {
                                const contractData = {
                                    title: formData.title,
                                    type: selectedType,
                                    counterparty_name: formData.counterpartyName || null,
                                    value: formData.value ? Number(formData.value) : null,
                                    effective_date: formData.effectiveDate || null,
                                    expiration_date: formData.expirationDate || null,
                                    auto_renew: formData.autoRenew,
                                    description: formData.description || null,
                                    status: "draft",
                                };
                                await createContract.mutateAsync(
                                    contractData as unknown as Parameters<
                                        typeof createContract.mutateAsync
                                    >[0]
                                );
                                router.push("/contracts");
                            } catch (error) {
                                logger.error("Failed to create contract", { error });
                            }
                        }}
                    >
                        {createContract.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        {createContract.isPending ? "Creating..." : "Create Contract"}
                    </Button>
                ) : (
                    <Button onClick={goNext} disabled={!canNext}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
