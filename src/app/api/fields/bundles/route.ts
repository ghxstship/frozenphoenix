/* ═══════════════════════════════════════════════════════════════
   FIELD BUNDLES API — List available bundles and org subscriptions
   
   GET /api/fields/bundles
   Returns all available bundles with org subscription status.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";

export async function GET() {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return ApiErrors.forbidden("No org membership found");
    }

    const orgId = membership.organization_id;

    // Load all active bundles with their field types
    const { data: bundles, error: bundlesError } = await supabase
        .from("field_bundles")
        .select(`
            bundle_id,
            name,
            description,
            base_tier_required,
            monthly_price_cents,
            is_active,
            field_bundle_items (
                field_type_id
            )
        `)
        .eq("is_active", true)
        .order("monthly_price_cents", { ascending: true });

    if (bundlesError) {
        return ApiErrors.internalError(bundlesError.message);
    }

    // Load org's active bundle subscriptions
    const { data: orgBundles } = await supabase
        .from("org_bundle_subscriptions")
        .select("bundle_id, status, activated_at, expires_at")
        .eq("organization_id", orgId)
        .eq("status", "active");

    const activeBundleIds = new Set(
        (orgBundles ?? []).map((ob) => ob.bundle_id)
    );

    // Load org subscription tier
    const { data: subscription } = await supabase
        .from("org_subscriptions")
        .select("pricing_tier")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .limit(1)
        .single();

    const orgTier = subscription?.pricing_tier ?? "core";

    const enrichedBundles = (bundles ?? []).map((b) => ({
        ...b,
        fieldTypeIds: (b.field_bundle_items ?? []).map(
            (fi: { field_type_id: string }) => fi.field_type_id
        ),
        isSubscribed: activeBundleIds.has(b.bundle_id),
        isEligible: tierSatisfies(orgTier, b.base_tier_required),
    }));

    return NextResponse.json({
        orgTier,
        bundles: enrichedBundles,
    });
}

function tierSatisfies(orgTier: string, requiredTier: string): boolean {
    const hierarchy: Record<string, number> = { core: 0, pro: 1, enterprise: 2 };
    return (hierarchy[orgTier] ?? 0) >= (hierarchy[requiredTier] ?? 0);
}
