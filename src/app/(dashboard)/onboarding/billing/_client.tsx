"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrfHeaders } from "@/lib/csrf";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Bot,
    Brain,
    Check,
    CreditCard,
    Crown,
    Loader2,
    Lock,
    Palette,
    Plug,
    Shield,
    Users,
    Workflow,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingPlan, useSelectPlan } from "@/lib/supabase";
import {
    formatTierPrice,
    type PricingTier,
    TIER_DISPLAY,
    TIER_ENTITLEMENTS,
} from "@/config/tier-entitlements";
import { PageHeader } from "@/components/ui/page-header";

// ─── Capability-focused feature descriptions per tier ────────

interface PlanCard {
    tier: PricingTier;
    icon: React.ElementType;
    highlights: string[];
    recommended?: boolean;
}

const PLAN_CARDS: PlanCard[] = [
    {
        tier: "starter",
        icon: Zap,
        highlights: [
            "CRM & pipeline management",
            "3 users included",
            "Basic time tracking",
            "Community support",
        ],
    },
    {
        tier: "core",
        icon: Shield,
        highlights: [
            "Everything in Starter",
            "CRM + Finance modules",
            "5 seats included",
            "Email support",
        ],
    },
    {
        tier: "team",
        icon: Users,
        highlights: [
            "Everything in Core",
            "Invoicing & resource planner",
            "All 6 RBAC roles",
            "10 automation rules",
            "Read-only API access",
            "Logo & accent customization",
        ],
        recommended: true,
    },
    {
        tier: "pro",
        icon: Crown,
        highlights: [
            "Everything in Team",
            "Production, Live Ops, Creative, Legal",
            "Field-level masking",
            "Webhooks & full API",
            "AI copilot & reports",
            "Custom brand kit & PDF templates",
        ],
    },
    {
        tier: "enterprise",
        icon: Brain,
        highlights: [
            "Everything in Pro",
            "Spatial hierarchy & revenue engine",
            "Custom roles & ABAC",
            "SSO, bi-directional sync",
            "Multi-step automations",
            "AI summaries, NL query, predictions",
            "White-label domain & multi-brand",
        ],
    },
];

// ─── Capability dimension icons ──────────────────────────────

const DIMENSION_ICONS: Record<string, React.ElementType> = {
    modules: Zap,
    rbac: Shield,
    integrations: Plug,
    automations: Workflow,
    ai: Bot,
    customization: Palette,
};

const DIMENSION_LABELS: Record<string, string> = {
    modules: "Modules",
    rbac: "Access Control",
    integrations: "Integrations",
    automations: "Automations",
    ai: "AI",
    customization: "Customization",
};

export function BillingSetupPageClient() {
    const { data: existingPlan, isLoading: planLoading } = useBillingPlan();

    if (planLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const resolvedTier: PricingTier = existingPlan
        ? ((existingPlan.pricing_tier as PricingTier) ?? "team")
        : "team";
    const resolvedCycle: "monthly" | "annual" = existingPlan
        ? (existingPlan.billing_cycle as string) === "monthly"
            ? "monthly"
            : "annual"
        : "annual";

    return <BillingForm defaultTier={resolvedTier} defaultCycle={resolvedCycle} />;
}

function BillingForm({
    defaultTier,
    defaultCycle,
}: {
    defaultTier: PricingTier;
    defaultCycle: "monthly" | "annual";
}) {
    const router = useRouter();
    const [billingStepId, setBillingStepId] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(defaultCycle);
    const [selectedTier, setSelectedTier] = useState<PricingTier>(defaultTier);
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
            await selectPlan.mutateAsync({
                pricing_tier: selectedTier,
                billing_cycle: billingCycle,
            });
        } catch {
            // Subscription creation failed — still allow navigation
        }
        try {
            if (billingStepId) {
                await fetch("/api/onboarding/progress", {
                    method: "POST",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({
                        step_definition_id: billingStepId,
                        status: "completed",
                    }),
                });
            }
        } catch {
            // Non-critical — navigate regardless
        }
        router.push("/onboarding/complete");
    }, [billingStepId, router, selectedTier, billingCycle, selectPlan]);

    const skipAndNavigate = useCallback(async () => {
        setCompleting(true);
        try {
            if (billingStepId) {
                await fetch("/api/onboarding/progress", {
                    method: "POST",
                    headers: csrfHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify({
                        step_definition_id: billingStepId,
                        status: "completed",
                    }),
                });
            }
        } catch {
            // Non-critical — navigate regardless
        }
        router.push("/onboarding/complete");
    }, [billingStepId, router]);

    const annualSavings = useMemo(() => {
        const ent = TIER_ENTITLEMENTS.team;
        if (ent.pricing.monthlyBaseCents === 0) return 0;
        return Math.round(
            ((ent.pricing.monthlyBaseCents * 12 - ent.pricing.annualBaseCents) /
                (ent.pricing.monthlyBaseCents * 12)) *
                100
        );
    }, []);

    const selectedDisplay = TIER_DISPLAY[selectedTier];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-6xl space-y-8">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 justify-center">
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                    <div className="h-2 w-12 rounded-full bg-primary" />
                </div>

                <PageHeader
                    centered
                    icon={CreditCard}
                    title="Choose your plan"
                    description="Plans differ by capabilities — not just seats. Unlock modules, integrations, automations, AI, and customization as your team grows."
                />

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
                        {annualSavings > 0 && (
                            <Badge variant="success" className="text-[10px] px-1.5">
                                Save {annualSavings}%
                            </Badge>
                        )}
                    </button>
                </div>

                {/* Plan cards — 5 tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {PLAN_CARDS.map((card) => {
                        const display = TIER_DISPLAY[card.tier];
                        const entitlements = TIER_ENTITLEMENTS[card.tier];
                        const priceLabel = formatTierPrice(card.tier, billingCycle);
                        const isSelected = selectedTier === card.tier;
                        const isFree = entitlements.pricing.monthlyBaseCents === 0;
                        const Icon = card.icon;

                        return (
                            <button
                                key={card.tier}
                                onClick={() => setSelectedTier(card.tier)}
                                className={cn(
                                    "relative rounded-xl border p-5 text-left transition-all flex flex-col",
                                    isSelected
                                        ? "border-primary ring-2 ring-primary/20 bg-primary/[0.02]"
                                        : "border-border hover:border-primary/40 bg-card"
                                )}
                            >
                                {card.recommended && (
                                    <Badge
                                        variant="default"
                                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px]"
                                    >
                                        Most popular
                                    </Badge>
                                )}

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                                isSelected ? "bg-primary/10" : "bg-muted"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-4 w-4",
                                                    isSelected
                                                        ? "text-primary"
                                                        : "text-muted-foreground"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">
                                                {display.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground">
                                                {display.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">{priceLabel}</span>
                                        {!isFree && (
                                            <span className="text-[10px] text-muted-foreground">
                                                /mo base
                                            </span>
                                        )}
                                    </div>

                                    {!isFree && (
                                        <p className="text-[10px] text-muted-foreground">
                                            {entitlements.pricing.includedSeats} seats included
                                            {entitlements.pricing.overagePerSeatCents > 0 &&
                                                ` · $${(entitlements.pricing.overagePerSeatCents / 100).toFixed(0)}/extra seat`}
                                        </p>
                                    )}

                                    <div className="border-t pt-3 space-y-1.5">
                                        {card.highlights.map((hl) => (
                                            <div
                                                key={hl}
                                                className="flex items-start gap-1.5 text-[11px]"
                                            >
                                                <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
                                                <span>{hl}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Capability dimension badges */}
                                <div className="border-t pt-3 mt-3 flex flex-wrap gap-1.5">
                                    {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                                        const sectionObj = entitlements[
                                            key as keyof typeof entitlements
                                        ] as Record<string, unknown>;
                                        const hasCapability = Object.values(sectionObj).some(
                                            (v) =>
                                                v === true ||
                                                (typeof v === "number" && v !== 0) ||
                                                (typeof v === "string" &&
                                                    v !== "none" &&
                                                    v !== "") ||
                                                (Array.isArray(v) && v.length > 0)
                                        );
                                        const DimIcon = DIMENSION_ICONS[key] ?? Zap;

                                        return (
                                            <span
                                                key={key}
                                                className={cn(
                                                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px]",
                                                    hasCapability
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground/50"
                                                )}
                                            >
                                                {hasCapability ? (
                                                    <DimIcon className="h-2.5 w-2.5" />
                                                ) : (
                                                    <Lock className="h-2.5 w-2.5" />
                                                )}
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 max-w-xl mx-auto">
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
                        Continue with {selectedDisplay.name}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                    14-day free trial on all paid plans. No credit card required to start. Payment
                    processing will be configured in organization settings.
                </p>
            </div>
        </div>
    );
}
