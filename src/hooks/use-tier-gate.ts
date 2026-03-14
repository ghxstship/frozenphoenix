"use client";

/* ═══════════════════════════════════════════════════════════════
   USE TIER GATE — Runtime Tier Entitlement Check
   ═══════════════════════════════════════════════════════════════
   
   Resolves the current org's pricing tier from the billing
   subscription and checks entitlements against the SSOT config.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBillingPlan } from "@/lib/supabase/hooks-pages";
import {
    type EntitlementPath,
    getEntitlementLimit,
    getRequiredTierForEntitlement,
    isEntitlementEnabled,
    isTierAtLeast,
    type PricingTier,
    TIER_DISPLAY,
} from "@/config/tier-entitlements";

export interface TierGateResult {
    /** Whether the current org's tier allows this capability */
    allowed: boolean;
    /** The org's resolved pricing tier */
    currentTier: PricingTier;
    /** The minimum tier required for this capability */
    requiredTier: PricingTier;
    /** Display name of the required tier */
    requiredTierName: string;
    /** Whether subscription data is still loading */
    isLoading: boolean;
    /** Navigate to billing/upgrade page */
    showUpsell: () => void;
}

export function useTierGate(capability: EntitlementPath): TierGateResult {
    const { data: subscription, isLoading } = useBillingPlan();
    const router = useRouter();

    const currentTier: PricingTier = useMemo(() => {
        if (!subscription) return "starter";
        const tier = (subscription.legacy_tier_override ?? subscription.pricing_tier) as string;
        if (
            tier === "starter" ||
            tier === "core" ||
            tier === "team" ||
            tier === "pro" ||
            tier === "enterprise"
        ) {
            return tier;
        }
        return "starter";
    }, [subscription]);

    const requiredTier = useMemo(() => getRequiredTierForEntitlement(capability), [capability]);

    const allowed = useMemo(
        () => isEntitlementEnabled(currentTier, capability),
        [currentTier, capability]
    );

    const showUpsell = useCallback(() => {
        router.push("/onboarding/billing");
    }, [router]);

    return {
        allowed,
        currentTier,
        requiredTier,
        requiredTierName: TIER_DISPLAY[requiredTier].name,
        isLoading,
        showUpsell,
    };
}

// ─── Batch check: multiple capabilities at once ──────────────

export function useTierEntitlements(tier?: PricingTier) {
    const { data: subscription, isLoading } = useBillingPlan();

    const currentTier: PricingTier = useMemo(() => {
        if (tier) return tier;
        if (!subscription) return "starter";
        const t = (subscription.legacy_tier_override ?? subscription.pricing_tier) as string;
        if (t === "starter" || t === "core" || t === "team" || t === "pro" || t === "enterprise") {
            return t;
        }
        return "starter";
    }, [tier, subscription]);

    const check = useCallback(
        (capability: EntitlementPath) => isEntitlementEnabled(currentTier, capability),
        [currentTier]
    );

    const limit = useCallback(
        (capability: EntitlementPath) => getEntitlementLimit(currentTier, capability),
        [currentTier]
    );

    const meetsMinTier = useCallback(
        (required: PricingTier) => isTierAtLeast(currentTier, required),
        [currentTier]
    );

    return { currentTier, isLoading, check, limit, meetsMinTier };
}
