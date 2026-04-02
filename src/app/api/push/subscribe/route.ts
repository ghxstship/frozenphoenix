import { NextResponse } from "next/server";
import webpush from "web-push";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

// ─── VAPID helper ─────────────────────────────────────────────────────────────

function initWebPush(): typeof webpush | null {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT ?? "mailto:support@atlvs.one";
    if (!publicKey || !privateKey) return null;
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return webpush;
}

// Export so the notification dispatch route can import it
export { initWebPush };

/**
 * POST /api/push/subscribe
 *
 * Saves a Web Push subscription for the authenticated user.
 * Called by the browser after pushManager.subscribe() succeeds.
 *
 * Body: { subscription: PushSubscriptionJSON }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/push/subscribe",
        mutation: true,
        rbac: { resource: "dashboard", action: "read" },
    },
    async (request, { supabase, user }) => {
        const body = await request.json().catch(() => null);
        if (!body?.subscription) {
            return NextResponse.json({ error: "subscription is required" }, { status: 400 });
        }

        const { subscription } = body as { subscription: PushSubscriptionJSON };

        // Upsert keyed by endpoint so each browser/device gets one row
        const { error } = await serverFromTable(supabase, "push_subscriptions").upsert(
            {
                user_id: user.id,
                endpoint: subscription.endpoint,
                subscription_json: subscription,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "endpoint" }
        );

        if (error) {
            return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    }
);

/**
 * DELETE /api/push/subscribe
 *
 * Removes a Web Push subscription for the authenticated user.
 * Body: { endpoint: string }
 */
export const DELETE = withApiHandler(
    {
        method: "DELETE",
        route: "/api/push/subscribe",
        mutation: true,
        rbac: { resource: "dashboard", action: "read" },
    },
    async (request, { supabase, user }) => {
        const body = await request.json().catch(() => null);
        if (!body?.endpoint) {
            return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
        }

        await serverFromTable(supabase, "push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", body.endpoint);

        return NextResponse.json({ ok: true });
    }
);
