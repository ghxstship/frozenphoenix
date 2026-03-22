"use client";

/* ═══════════════════════════════════════════════════════════════
   TIER GATE — Declarative UI Gating Component
   ═══════════════════════════════════════════════════════════════
   
   Wraps children in a tier check. Two enforcement modes:
   - "soft"  → renders fallback (upsell prompt) when tier insufficient
   - "hard"  → renders nothing (feature completely hidden)
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { useTierGate } from "@/hooks/use-tier-gate";
import { UpsellCard } from "@/components/app/upsell-card";
import type { EntitlementPath } from "@/config/tier-entitlements";

interface TierGateProps {
    /** Entitlement path to check, e.g. "modules.liveOps" or "ai.copilot" */
    requires: EntitlementPath;
    /** "soft" shows upsell fallback; "hard" hides completely. Default: "soft" */
    enforcement?: "soft" | "hard";
    /** Custom fallback for soft gate. Defaults to <UpsellCard />. */
    fallback?: React.ReactNode;
    /** Optional label describing what this feature is (used in default upsell) */
    featureLabel?: string;
    children: React.ReactNode;
}

export function TierGate({
    requires,
    enforcement = "soft",
    fallback,
    featureLabel,
    children,
}: TierGateProps) {
    const { allowed, isLoading, requiredTier, requiredTierName } = useTierGate(requires);

    if (isLoading) return null;

    if (allowed) {
        return <>{children}</>;
    }

    if (enforcement === "hard") {
        return null;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <UpsellCard
            requiredTier={requiredTier}
            requiredTierName={requiredTierName}
            featureLabel={featureLabel}
        />
    );
}

// ─── Inline gating for nav items and small elements ──────────

interface TierGateInlineProps {
    requires: EntitlementPath;
    children: React.ReactNode;
}

export function TierGateInline({ requires, children }: TierGateInlineProps) {
    const { allowed, isLoading } = useTierGate(requires);
    if (isLoading || !allowed) return null;
    return <>{children}</>;
}
