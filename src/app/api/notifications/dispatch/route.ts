import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { buildTransactionalEmail, sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/notifications/dispatch
 *
 * Processes a notification and dispatches it via configured channels
 * (email) based on the user's notification preferences.
 *
 * Called internally after a notification row is inserted — either by
 * the automation engine, a DB trigger (via pg_net), or application code.
 *
 * Body: { notification_id: string }
 *   OR: { user_id, title, body, type?, entity_type?, entity_id?, action_url?, organization_id? }
 *       (creates the notification row AND dispatches)
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/notifications/dispatch",
        mutation: true,
    },
    async (request, { log }) => {
        const admin = createAdminClient();
        if (!admin) {
            return ApiErrors.serviceUnavailable("Admin client not configured");
        }

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        // ── Path A: Dispatch an existing notification by ID ──
        if (body.notification_id && typeof body.notification_id === "string") {
            const { data: notification, error } = await serverFromTable(admin!, "notifications")
                .select("*")
                .eq("id", body.notification_id)
                .single();

            if (error || !notification) {
                return ApiErrors.notFound("Notification");
            }

            const result = await dispatchToEmail(admin, notification as unknown as NotificationRow);
            return NextResponse.json(result);
        }

        // ── Path B: Create + dispatch in one call ──
        const userId = body.user_id as string | undefined;
        const title = body.title as string | undefined;

        if (!userId || !title) {
            return ApiErrors.badRequest("user_id and title are required");
        }

        const messageText = (body.body as string) || title;

        const { data: notification, error: insertErr } = await serverFromTable(
            admin!,
            "notifications"
        )
            .insert({
                user_id: userId,
                title,
                message: messageText,
                type: (body.type as string) || "info",
                action_url: (body.action_url as string) || null,
            })
            .select("*")
            .single();

        if (insertErr || !notification) {
            log.error("Failed to insert notification", { error: insertErr });
            return ApiErrors.internalError("Failed to create notification");
        }

        const result = await dispatchToEmail(admin, notification as unknown as NotificationRow);
        return NextResponse.json(result, { status: 201 });
    }
);

// ─── Types ──────────────────────────────────────────────────────

/** Matches notifications table (migration 001 + 034 extensions). */
interface NotificationRow {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    action_url: string | null;
    created_at: string | null;
    body?: string | null;
    entity_type?: string | null;
    entity_id?: string | null;
    read_at?: string | null;
    channel?: string | null;
    organization_id?: string | null;
}

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/** Categories JSONB shape from notification_preferences (migration 006). */
interface CategoryPrefs {
    email?: boolean;
    push?: boolean;
    in_app?: boolean;
}

// ─── Dispatch Logic ─────────────────────────────────────────────

async function dispatchToEmail(
    admin: AdminClient,
    notification: NotificationRow
): Promise<{ dispatched: boolean; channel?: string; reason?: string }> {
    // 1. Check user's notification preferences (migration 006 schema)
    //    Single row per user with email_enabled toggle + categories JSONB
    const { data: prefs } = await serverFromTable(admin, "notification_preferences")
        .select("email_enabled, categories")
        .eq("user_id", notification.user_id)
        .single();

    if (prefs) {
        // Global email kill switch
        if (prefs.email_enabled === false) {
            return { dispatched: false, reason: "email_disabled_globally" };
        }

        // Per-category opt-out via categories JSONB
        // Map notification.type to a category key
        const notificationType = notification.type;
        const categoryKey = mapNotificationTypeToCategory(notificationType);
        if (categoryKey && prefs.categories) {
            const categories = prefs.categories as Record<string, CategoryPrefs>;
            const catPref = categories[categoryKey];
            if (catPref && catPref.email === false) {
                return { dispatched: false, reason: `email_disabled_for_${categoryKey}` };
            }
        }
    }
    // No prefs row → defaults to email_enabled=true (schema default)

    // 2. Look up user email from user_profiles
    const { data: profile } = await serverFromTable(admin, "user_profiles")
        .select("email, display_name")
        .eq("id", notification.user_id)
        .single();

    if (!profile?.email) {
        logger.warn("Cannot dispatch email — no profile email", {
            userId: notification.user_id,
        });
        return { dispatched: false, reason: "no_email" };
    }

    // 3. Build and send the email
    const actionUrl = notification.action_url;

    const html = buildTransactionalEmail({
        heading: notification.title,
        message: notification.message,
        ctaLabel: actionUrl ? "View Details" : undefined,
        ctaUrl: actionUrl || undefined,
        footerNote: "You can manage your notification preferences in Settings > Notifications.",
    });

    const emailResult = await sendEmail({
        to: profile.email,
        subject: notification.title,
        html,
    });

    if (emailResult.sent || emailResult.fallback) {
        return { dispatched: true, channel: "email" };
    }

    logger.error("Notification email dispatch failed", {
        notificationId: notification.id,
        error: emailResult.error,
    });
    return { dispatched: false, reason: emailResult.error || "delivery_failed" };
}

/**
 * Maps a notification `type` value to the categories JSONB key
 * used in notification_preferences (migration 006).
 *
 * The categories JSONB defaults to keys:
 *   approvals, tasks, mentions, deadlines, status_changes, comments, system
 */
function mapNotificationTypeToCategory(type: string): string | null {
    const map: Record<string, string> = {
        info: "system",
        warning: "system",
        error: "system",
        success: "system",
        approval: "approvals",
        task: "tasks",
        mention: "mentions",
        deadline: "deadlines",
        status_change: "status_changes",
        comment: "comments",
        automation: "system",
    };
    return map[type] ?? null;
}
