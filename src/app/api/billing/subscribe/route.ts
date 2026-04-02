import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { billingSubscribeSchema } from "@/lib/validation/api-schemas";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { getStripe } from "@/lib/stripe/client";

// Stripe price IDs per tier+cycle — set in Stripe Dashboard and .env.local
const STRIPE_PRICE_MAP: Record<string, Record<string, string>> = {
    pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
        annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
    },
    enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
        annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? "",
    },
};

/**
 * POST /api/billing/subscribe
 *
 * Strategy:
 *  - If STRIPE_SECRET_KEY is set → creates a Stripe Checkout session and
 *    returns redirect_url. The client should redirect the user to this URL.
 *  - Otherwise → upserts an org_subscriptions row with status "trialing"
 *    (14-day trial). Starter tier always activates immediately.
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
        const isFree = pricing_tier === "starter";

        // Strategy 1: Stripe Checkout (when key is configured and tier is paid)
        const stripe = getStripe();
        if (stripe && !isFree) {
            const priceId = STRIPE_PRICE_MAP[pricing_tier]?.[billing_cycle];
            if (!priceId) {
                return ApiErrors.badRequest(
                    `No Stripe price configured for ${pricing_tier}/${billing_cycle}. ` +
                        `Set STRIPE_PRICE_${pricing_tier.toUpperCase()}_${billing_cycle.toUpperCase()} in .env.`
                );
            }

            const appUrl =
                process.env.NEXT_PUBLIC_APP_URL ??
                (process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : "https://atlvs.one");

            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [{ price: priceId, quantity: 1 }],
                subscription_data: {
                    trial_period_days: 14,
                    metadata: { organization_id: orgId, pricing_tier, billing_cycle },
                },
                metadata: { organization_id: orgId, user_id: user.id },
                success_url: `${appUrl}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${appUrl}/settings/billing?canceled=1`,
                ...(user.email ? { customer_email: user.email } : {}),
            });

            return NextResponse.json({ redirect_url: session.url, session_id: session.id });
        }

        // Strategy 2: Direct DB record (starter tier or no Stripe key)
        const now = new Date();
        const trialEnd = isFree ? null : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
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
            .select(
                "id, organization_id, pricing_tier, billing_cycle, status, current_period_start, current_period_end, trial_ends_at, created_at"
            )
            .single();

        if (error) {
            return ApiErrors.internalError("Failed to create subscription");
        }

        return NextResponse.json({ subscription: data });
    }
);

/**
 * GET /api/billing/subscribe — returns the current org subscription.
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
            .select(
                "id, organization_id, pricing_tier, billing_cycle, status, current_period_start, current_period_end, trial_ends_at, created_at"
            )
            .eq("organization_id", membership.organization_id)
            .single();

        return NextResponse.json({ subscription: data ?? null });
    }
);
