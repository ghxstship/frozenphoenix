"use client";

/* ═══════════════════════════════════════════════════════════════
   UPSELL CARD — Upgrade Prompt Component
   ═══════════════════════════════════════════════════════════════
   
   Displayed when a user encounters a soft-gated feature that
   requires a higher tier. Shows the required tier and a CTA
   to the billing/upgrade page.
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/config/tier-entitlements";

interface UpsellCardProps {
    requiredTier: PricingTier;
    requiredTierName: string;
    featureLabel?: string | undefined;
    className?: string | undefined;
    compact?: boolean | undefined;
}

export function UpsellCard({
    requiredTierName,
    featureLabel,
    className,
    compact = false,
}: UpsellCardProps) {
    const router = useRouter();

    if (compact) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/onboarding/billing")}
                className={cn(
                    "gap-1.5 border-dashed border-primary/30 bg-primary/[0.03] hover:border-primary/50 hover:bg-primary/[0.06]",
                    className
                )}
            >
                <Lock className="h-3 w-3 text-primary/60" aria-hidden="true" />
                <span>{requiredTierName} plan</span>
            </Button>
        );
    }

    return (
        <div
            className={cn(
                "rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-6",
                "flex flex-col items-center justify-center gap-3 text-center",
                className
            )}
            role="region"
            aria-label={`Upgrade required${featureLabel ? ` for ${featureLabel}` : ""}`}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                    {featureLabel ? `${featureLabel} requires` : "Requires"} the {requiredTierName}{" "}
                    plan
                </h3>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                    Upgrade to unlock this feature and more advanced capabilities for your team.
                </p>
            </div>

            <Button size="sm" onClick={() => router.push("/onboarding/billing")} className="mt-1">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                View plans
            </Button>
        </div>
    );
}
