"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, CreditCard, Loader2, Sparkles, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingPlan, useSelectPlan } from "@/lib/supabase/hooks-pages";

interface PlanTier {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    icon: React.ElementType;
    features: string[];
    limits: { seats: string; storage: string; projects: string };
    recommended?: boolean;
}

const PLANS: PlanTier[] = [
    {
        id: "starter",
        name: "Starter",
        description: "For small teams getting started with production management",
        monthlyPrice: 29,
        annualPrice: 290,
        icon: Zap,
        features: [
            "Up to 5 team members",
            "3 active projects",
            "Time tracking & timesheets",
            "Basic reporting",
            "Email support",
        ],
        limits: { seats: "5", storage: "10 GB", projects: "3" },
    },
    {
        id: "professional",
        name: "Professional",
        description: "For growing teams that need full production workflows",
        monthlyPrice: 79,
        annualPrice: 790,
        icon: Users,
        features: [
            "Up to 25 team members",
            "Unlimited projects",
            "Resource planner & scheduling",
            "Approvals & lifecycle matrix",
            "Client portal access",
            "Advanced reports & CSV export",
            "Priority support",
        ],
        limits: { seats: "25", storage: "100 GB", projects: "Unlimited" },
        recommended: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "For large organizations with complex compliance needs",
        monthlyPrice: 199,
        annualPrice: 1990,
        icon: Sparkles,
        features: [
            "Unlimited team members",
            "Unlimited projects",
            "Everything in Professional",
            "SSO & MFA enforcement",
            "Custom roles & RBAC",
            "AI report generation",
            "Audit logs & compliance",
            "Dedicated account manager",
        ],
        limits: { seats: "Unlimited", storage: "1 TB", projects: "Unlimited" },
    },
];

const PLAN_TO_TIER: Record<string, "core" | "pro" | "enterprise"> = {
    starter: "core",
    professional: "pro",
    enterprise: "enterprise",
};

const TIER_TO_PLAN: Record<string, string> = {
    core: "starter",
    pro: "professional",
    enterprise: "enterprise",
};

export default function BillingSetupPage() {
    const { data: existingPlan, isLoading: planLoading } = useBillingPlan();

    if (planLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const resolvedPlan = existingPlan
        ? (TIER_TO_PLAN[existingPlan.pricing_tier as string] ?? "professional")
        : "professional";
    const resolvedCycle: "monthly" | "annual" = existingPlan
        ? (existingPlan.billing_cycle as string) === "monthly"
            ? "monthly"
            : "annual"
        : "annual";

    return <BillingForm defaultPlan={resolvedPlan} defaultCycle={resolvedCycle} />;
}

function BillingForm({
    defaultPlan,
    defaultCycle,
}: {
    defaultPlan: string;
    defaultCycle: "monthly" | "annual";
}) {
    const router = useRouter();
    const [billingStepId, setBillingStepId] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(defaultCycle);
    const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlan);
    const selectPlan = useSelectPlan();

    useEffect(() => {
        async function fetchBillingStep() {
            try {
                const res = await fetch("/api/onboarding/progress");
                if (!res.ok) return;
                const data = await res.json();
                const step = (data.steps ?? []).find(
                    (s: Record<string, unknown>) => s.step_key === "configure_billing"
                );
                if (step) setBillingStepId(step.id as string);
            } catch {
                // Non-critical — skip silently
            }
        }
        fetchBillingStep();
    }, []);

    const handleSelectPlanAndContinue = useCallback(async () => {
        setCompleting(true);
        try {
            const tier = PLAN_TO_TIER[selectedPlan] ?? "core";
            await selectPlan.mutateAsync({ pricing_tier: tier, billing_cycle: billingCycle });
        } catch {
            // Subscription creation failed — still allow navigation
        }
        try {
            if (billingStepId) {
                await fetch("/api/onboarding/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        step_definition_id: billingStepId,
                        status: "completed",
                    }),
                });
            }
        } catch {
            // Non-critical — navigate regardless
        }
        router.push("/dashboard");
    }, [billingStepId, router, selectedPlan, billingCycle, selectPlan]);

    const skipAndNavigate = useCallback(async () => {
        setCompleting(true);
        try {
            if (billingStepId) {
                await fetch("/api/onboarding/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        step_definition_id: billingStepId,
                        status: "completed",
                    }),
                });
            }
        } catch {
            // Non-critical — navigate regardless
        }
        router.push("/dashboard");
    }, [billingStepId, router]);

    const annualSavings = Math.round(
        ((PLANS[1]!.monthlyPrice * 12 - PLANS[1]!.annualPrice) / (PLANS[1]!.monthlyPrice * 12)) *
            100
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-4xl space-y-8">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 justify-center">
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
                        <CreditCard className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Choose your plan</h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Select a plan that fits your team. You can upgrade or downgrade anytime.
                    </p>
                </div>

                {/* Billing cycle toggle */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                            "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
                            billingCycle === "monthly"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("annual")}
                        className={cn(
                            "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                            billingCycle === "annual"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Annual
                        <Badge variant="success" className="text-[10px] px-1.5">
                            Save {annualSavings}%
                        </Badge>
                    </button>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => {
                        const price =
                            billingCycle === "monthly"
                                ? plan.monthlyPrice
                                : Math.round(plan.annualPrice / 12);
                        const isSelected = selectedPlan === plan.id;
                        const Icon = plan.icon;

                        return (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={cn(
                                    "relative rounded-xl border p-6 text-left transition-all",
                                    isSelected
                                        ? "border-primary ring-2 ring-primary/20 bg-primary/[0.02]"
                                        : "border-border hover:border-primary/40 bg-card"
                                )}
                            >
                                {plan.recommended && (
                                    <Badge
                                        variant="default"
                                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px]"
                                    >
                                        Recommended
                                    </Badge>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "h-9 w-9 rounded-lg flex items-center justify-center",
                                                isSelected ? "bg-primary/10" : "bg-muted"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-4.5 w-4.5",
                                                    isSelected
                                                        ? "text-primary"
                                                        : "text-muted-foreground"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{plan.name}</h3>
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {plan.description}
                                    </p>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">${price}</span>
                                        <span className="text-xs text-muted-foreground">
                                            /seat/mo
                                        </span>
                                    </div>

                                    {billingCycle === "annual" && (
                                        <p className="text-[10px] text-muted-foreground">
                                            ${plan.annualPrice}/year billed annually
                                        </p>
                                    )}

                                    <div className="border-t pt-4 space-y-2">
                                        {plan.features.map((feature) => (
                                            <div
                                                key={feature}
                                                className="flex items-start gap-2 text-xs"
                                            >
                                                <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-3 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Seats
                                            </div>
                                            <div className="text-xs font-medium">
                                                {plan.limits.seats}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Storage
                                            </div>
                                            <div className="text-xs font-medium">
                                                {plan.limits.storage}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Projects
                                            </div>
                                            <div className="text-xs font-medium">
                                                {plan.limits.projects}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={skipAndNavigate}
                        disabled={completing}
                        className="flex-1"
                    >
                        {completing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Skip for now
                    </Button>
                    <Button
                        onClick={handleSelectPlanAndContinue}
                        disabled={completing}
                        className="flex-1"
                    >
                        {completing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Continue with {PLANS.find((p) => p.id === selectedPlan)?.name ?? "plan"}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                    14-day free trial on all plans. No credit card required to start. Payment
                    processing will be configured in organization settings.
                </p>
            </div>
        </div>
    );
}
