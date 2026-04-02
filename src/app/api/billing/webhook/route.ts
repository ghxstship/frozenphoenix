import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";

/**
 * POST /api/billing/webhook
 *
 * Stripe webhook handler. Receives signed events from Stripe and keeps
 * org_subscriptions in sync with the real subscription state.
 *
 * Events handled:
 *  - checkout.session.completed      → mark subscription active, save stripe IDs
 *  - customer.subscription.updated   → sync status/period
 *  - customer.subscription.deleted   → mark as canceled
 *  - invoice.payment_failed          → mark as past_due
 */
export async function POST(request: NextRequest) {
    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orgId = session.metadata?.organization_id;
            if (!orgId || session.mode !== "subscription") break;

            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            await serverFromTable(supabase, "org_subscriptions").upsert(
                {
                    organization_id: orgId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscription.id,
                    status: subscription.status,
                    current_period_start: new Date(
                        (subscription.items.data[0]?.current_period_start ?? 0) * 1000
                    ).toISOString(),
                    current_period_end: new Date(
                        (subscription.items.data[0]?.current_period_end ?? 0) * 1000
                    ).toISOString(),
                },
                { onConflict: "organization_id" }
            );
            break;
        }

        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const orgId = sub.metadata?.organization_id;
            if (!orgId) break;

            await serverFromTable(supabase, "org_subscriptions")
                .update({
                    status: sub.status,
                    current_period_start: new Date(
                        (sub.items.data[0]?.current_period_start ?? 0) * 1000
                    ).toISOString(),
                    current_period_end: new Date(
                        (sub.items.data[0]?.current_period_end ?? 0) * 1000
                    ).toISOString(),
                })
                .eq("stripe_subscription_id", sub.id);
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await serverFromTable(supabase, "org_subscriptions")
                .update({ status: "canceled" })
                .eq("stripe_subscription_id", sub.id);
            break;
        }

        case "invoice.payment_failed": {
            const inv = event.data.object as Stripe.Invoice & { subscription?: string };
            if (inv.subscription) {
                await serverFromTable(supabase, "org_subscriptions")
                    .update({ status: "past_due" })
                    .eq("stripe_subscription_id", inv.subscription);
            }
            break;
        }
    }

    return NextResponse.json({ received: true });
}
