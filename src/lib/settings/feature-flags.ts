/* ═══════════════════════════════════════════════════════════════
   ATLVS — Feature Flag Evaluation Engine
   Client-side evaluation with server-side fallback via Supabase RPC
   ═══════════════════════════════════════════════════════════════ */

import type { FeatureFlag, FeatureFlagOverride } from "@/types/settings";

interface FlagContext {
    userId?: string;
    orgId?: string;
    role?: string;
    environment?: string;
    region?: string;
}

/**
 * Client-side feature flag evaluation.
 * Mirrors the DB function evaluate_feature_flag() for offline/fast evaluation.
 */
export function evaluateFlag(
    flag: FeatureFlag,
    overrides: FeatureFlagOverride[],
    context: FlagContext
): unknown {
    // Inactive flags return default
    if (!flag.is_active) {
        return flag.default_value;
    }

    // Check lifecycle dates
    const now = new Date();
    if (flag.starts_at && now < new Date(flag.starts_at)) {
        return flag.default_value;
    }
    if (flag.expires_at && now > new Date(flag.expires_at)) {
        return flag.default_value;
    }

    // Check user-specific override first (most specific)
    if (context.userId) {
        const userOverride = overrides.find(
            (o) =>
                o.scope_type === "user" &&
                o.scope_id === context.userId &&
                (!o.expires_at || new Date(o.expires_at) > now)
        );
        if (userOverride) return userOverride.value;

        // Check if user is directly targeted
        if (flag.target_user_ids.includes(context.userId)) {
            return true;
        }
    }

    // Check role targeting
    if (context.role && flag.target_roles.includes(context.role)) {
        return true;
    }

    // Check org override
    if (context.orgId) {
        const orgOverride = overrides.find(
            (o) =>
                o.scope_type === "organization" &&
                o.scope_id === context.orgId &&
                (!o.expires_at || new Date(o.expires_at) > now)
        );
        if (orgOverride) return orgOverride.value;

        // Check if org is targeted
        if (flag.target_orgs.includes(context.orgId)) {
            return true;
        }
    }

    // Check environment targeting
    if (context.environment && flag.target_environments.includes(context.environment)) {
        return true;
    }

    // Check region targeting
    if (context.region && flag.target_regions.includes(context.region)) {
        return true;
    }

    // Percentage rollout (deterministic by userId hash)
    if (flag.flag_type === "percentage" && context.userId) {
        const hash = deterministicHash(context.userId + flag.key);
        if (hash % 100 < flag.rollout_percentage) {
            return true;
        }
        return false;
    }

    return flag.default_value;
}

/**
 * Evaluate a flag to a boolean (most common case).
 */
export function evaluateFlagBoolean(
    flag: FeatureFlag,
    overrides: FeatureFlagOverride[],
    context: FlagContext
): boolean {
    const result = evaluateFlag(flag, overrides, context);
    if (typeof result === "boolean") return result;
    if (result === "true") return true;
    if (result === "false") return false;
    return Boolean(result);
}

/**
 * Batch-evaluate all flags for a context.
 * Returns a Map<flagKey, boolean> for fast lookups.
 */
export function evaluateAllFlags(
    flags: FeatureFlag[],
    overrides: FeatureFlagOverride[],
    context: FlagContext
): Map<string, boolean> {
    const result = new Map<string, boolean>();
    for (const flag of flags) {
        const flagOverrides = overrides.filter((o) => o.flag_id === flag.id);
        result.set(flag.key, evaluateFlagBoolean(flag, flagOverrides, context));
    }
    return result;
}

/**
 * Simple deterministic hash for percentage rollouts.
 * Produces a positive integer from a string.
 */
function deterministicHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
