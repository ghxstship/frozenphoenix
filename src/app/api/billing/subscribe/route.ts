import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { billingSubscribeSchema } from "@/lib/validation/api-schemas";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/billing/subscribe
 *
 * Upserts an org_subscriptions row for the authenticated user's organization.
 * In production this would initiate a Stripe Checkout session; for now it
 * creates the subscription record directly with status "trialing" (14-day trial).
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/billing/subscribe",
        mutation: true,
        rbac: { resource: "billing", action: "write" },
    },
    async (request, { supabase, user }) => {
        const validated = await parseAndValidate(request, billingSubscribeSchema);
        if (!validated.success) return validated.response;

        const { pricing_tier, billing_cycle } = validated.data;

        // Resolve the user's active organization
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("is_default_org", true)
            .single();

        if (!membership?.organization_id) {
            return ApiErrors.badRequest("No active organization found. Complete org setup first.");
        }

        const orgId = membership.organization_id as string;
        const now = new Date();

        // Starter tier is free — activate immediately with no trial
        const isFree = pricing_tier === "starter";
        const trialEnd = isFree ? null : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day trial
        const periodEnd =
            billing_cycle === "annual"
                ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
                : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data, error } = await serverFromTable(supabase, "org_subscriptions")
            .upsert(
                {
                    organization_id: orgId,
                    pricing_tier,
                    billing_cycle,
                    status: isFree ? "active" : "trialing",
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    trial_ends_at: trialEnd?.toISOString() ?? null,
                },
                { onConflict: "organization_id" }
            )
            .select("*")
            .single();

        if (error) {
            return ApiErrors.internalError("Failed to create subscription");
        }

        return NextResponse.json({ subscription: data });
    }
);

/**
 * GET /api/billing/subscribe
 *
 * Returns the current org subscription (or null if none exists).
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/billing/subscribe",
        rbac: { resource: "billing", action: "read" },
    },
    async (_request, { supabase, user }) => {
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("is_default_org", true)
            .single();

        if (!membership?.organization_id) {
            return NextResponse.json({ subscription: null });
        }

        const { data } = await serverFromTable(supabase, "org_subscriptions")
            .select("*")
            .eq("organization_id", membership.organization_id)
            .single();

        return NextResponse.json({ subscription: data ?? null });
    }
);
