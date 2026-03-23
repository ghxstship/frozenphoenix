/* ═══════════════════════════════════════════════════════════════
   TIER MIDDLEWARE — Server-Side Tier Enforcement for API Routes
   ═══════════════════════════════════════════════════════════════
   
   Used in API route handlers to gate access based on the
   org's pricing tier. Reads from the SSOT tier-entitlements
   config. Returns 403 with upgrade prompt on insufficient tier.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-utils";
import {
    type EntitlementPath,
    getRequiredTierForEntitlement,
    isEntitlementEnabled,
    type PricingTier,
    TIER_DISPLAY,
} from "@/config/tier-entitlements";
import { type ServerClient, serverFromTable } from "@/lib/supabase/server";

interface TierCheckResult {
    allowed: boolean;
    currentTier: PricingTier;
    requiredTier: PricingTier;
    response?: NextResponse | undefined;
}

/**
 * Resolves the org's effective pricing tier from org_subscriptions.
 * Returns "starter" if no active subscription exists.
 */
export async function resolveOrgTier(
    supabase: ServerClient,
    organizationId: string
): Promise<PricingTier> {
    const { data } = await serverFromTable(supabase, "org_subscriptions")
        .select("pricing_tier, legacy_tier_override, status")
        .eq("organization_id", organizationId)
        .in("status", ["active", "trialing"])
        .single();

    if (!data) return "starter";

    const tier = ((data as Record<string, unknown>).legacy_tier_override ??
        (data as Record<string, unknown>).pricing_tier) as string;

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
}

/**
 * Checks if the org's tier allows a specific entitlement.
 * Returns a structured result with optional 403 response.
 */
export async function checkTierEntitlement(
    supabase: ServerClient,
    organizationId: string,
    capability: EntitlementPath
): Promise<TierCheckResult> {
    const currentTier = await resolveOrgTier(supabase, organizationId);
    const allowed = isEntitlementEnabled(currentTier, capability);
    const requiredTier = getRequiredTierForEntitlement(capability);

    if (allowed) {
        return { allowed: true, currentTier, requiredTier };
    }

    const requiredName = TIER_DISPLAY[requiredTier].name;
    return {
        allowed: false,
        currentTier,
        requiredTier,
        response: NextResponse.json(
            {
                error: {
                    code: "TIER_INSUFFICIENT",
                    message: `This feature requires the ${requiredName} plan or higher.`,
                    currentTier,
                    requiredTier,
                },
            },
            { status: 403 }
        ),
    };
}

/**
 * Quick guard for API routes. Returns the 403 response directly
 * if the tier check fails, or null if allowed.
 *
 * Usage in route handlers:
 * ```ts
 * const denied = await requireTier(supabase, orgId, "modules.liveOps");
 * if (denied) return denied;
 * ```
 */
export async function requireTier(
    supabase: ServerClient,
    organizationId: string,
    capability: EntitlementPath
): Promise<NextResponse | null> {
    const result = await checkTierEntitlement(supabase, organizationId, capability);
    return result.allowed ? null : (result.response ?? ApiErrors.forbidden());
}

/**
 * Checks a soft-limited counter (e.g., automation rules, AI reports).
 * Increments the counter if below limit. Returns 403 if at limit.
 */
export async function checkAndIncrementUsage(
    supabase: ServerClient,
    organizationId: string,
    counterKey: string,
    limit: number
): Promise<{ allowed: boolean; current: number; limit: number; response?: NextResponse }> {
    if (limit === -1) {
        return { allowed: true, current: 0, limit: -1 };
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]!;

    const { data: existing } = await serverFromTable(supabase, "tier_usage_counters")
        .select("id, current_count")
        .eq("organization_id", organizationId)
        .eq("counter_key", counterKey)
        .eq("period_start", periodStart)
        .single();

    const currentCount =
        ((existing as Record<string, unknown> | null)?.current_count as number) ?? 0;

    if (currentCount >= limit) {
        return {
            allowed: false,
            current: currentCount,
            limit,
            response: NextResponse.json(
                {
                    error: {
                        code: "USAGE_LIMIT_REACHED",
                        message: `You've reached the ${counterKey} limit (${limit}) for your current plan.`,
                        current: currentCount,
                        limit,
                    },
                },
                { status: 403 }
            ),
        };
    }

    if (existing) {
        await serverFromTable(supabase, "tier_usage_counters")
            .update({ current_count: currentCount + 1 })
            .eq("id", (existing as Record<string, unknown>).id);
    } else {
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            .toISOString()
            .split("T")[0]!;

        await serverFromTable(supabase, "tier_usage_counters").insert({
            organization_id: organizationId,
            counter_key: counterKey,
            current_count: 1,
            period_start: periodStart,
            period_end: periodEnd,
        });
    }

    return { allowed: true, current: currentCount + 1, limit };
}
