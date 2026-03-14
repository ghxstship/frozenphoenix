import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";

const sendMessageSchema = z.object({
    body: z.string().min(1).max(10000),
    body_html: z.string().max(50000).optional(),
    parent_message_id: z.string().uuid().optional(),
    mentioned_user_ids: z.array(z.string().uuid()).optional(),
    attachments: z
        .array(
            z.object({
                id: z.string(),
                file_name: z.string(),
                file_type: z.string(),
                file_size: z.number(),
                url: z.string().url(),
                thumbnail_url: z.string().url().optional(),
            })
        )
        .optional(),
    is_internal: z.boolean().optional(),
    priority: z.enum(["normal", "high", "urgent", "critical"]).optional(),
    is_mandatory_read: z.boolean().optional(),
    scheduled_at: z.string().datetime().optional(),
});

// In-memory rate limit store (per-process; use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id]/messages
 * Cursor-based pagination for conversation messages.
 */
export async function GET(request: NextRequest, context: RouteContext) {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify membership
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    if (!membership) return ApiErrors.forbidden("Not a member of this conversation");

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
    const threadId = searchParams.get("thread_id");

    let query = serverFromTable(admin!, "messages")
        .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (threadId) {
        query = query.eq("parent_message_id", threadId);
    } else {
        query = query.is("parent_message_id", null);
    }

    if (cursor) {
        query = query.lt("created_at", cursor);
    }

    const { data: messages, error } = await query;
    if (error) return ApiErrors.internalError("Failed to fetch messages");

    // Fetch reactions for these messages
    const messageIds =
        (messages as Record<string, unknown>[] | null)?.map((m) => m.id as string) ?? [];

    let reactions: Record<string, unknown>[] = [];
    if (messageIds.length > 0) {
        const { data: rxns } = await serverFromTable(admin!, "message_reactions")
            .select("message_id, user_id, emoji")
            .in("message_id", messageIds);
        reactions = (rxns as Record<string, unknown>[] | null) ?? [];
    }

    // Group reactions by message
    const reactionsByMessage = new Map<string, Record<string, unknown>[]>();
    for (const r of reactions) {
        const msgId = r.message_id as string;
        if (!reactionsByMessage.has(msgId)) reactionsByMessage.set(msgId, []);
        reactionsByMessage.get(msgId)!.push(r);
    }

    // Map messages with sender and reactions
    const enriched =
        (messages as Record<string, unknown>[] | null)?.map((m) => {
            const up = m.user_profiles as {
                id: string;
                display_name: string;
                avatar_url: string | null;
            } | null;
            const profile = up
                ? { id: up.id, name: up.display_name, avatar_url: up.avatar_url }
                : null;
            const msgReactions = reactionsByMessage.get(m.id as string) ?? [];

            // Aggregate reactions
            const emojiMap = new Map<string, { count: number; user_ids: string[] }>();
            for (const r of msgReactions) {
                const emoji = r.emoji as string;
                const uid = r.user_id as string;
                if (!emojiMap.has(emoji)) emojiMap.set(emoji, { count: 0, user_ids: [] });
                const entry = emojiMap.get(emoji)!;
                entry.count++;
                entry.user_ids.push(uid);
            }

            const aggregatedReactions = Array.from(emojiMap.entries()).map(([emoji, data]) => ({
                emoji,
                count: data.count,
                user_ids: data.user_ids,
                has_reacted: data.user_ids.includes(user.id),
            }));

            return {
                ...m,
                user_profiles: undefined,
                sender: profile,
                reactions: aggregatedReactions,
            };
        }) ?? [];

    const nextCursor =
        enriched.length === limit
            ? (enriched[enriched.length - 1] as Record<string, unknown>)?.created_at
            : null;

    return NextResponse.json({
        data: enriched,
        cursor: nextCursor,
        has_more: enriched.length === limit,
    });
}

/**
 * POST /api/conversations/[id]/messages
 * Send a message to a conversation. Rate limited: 60 msg/min per user.
 */
export async function POST(request: NextRequest, context: RouteContext) {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    // Rate limit
    if (!checkRateLimit(user.id)) {
        return ApiErrors.badRequest("Rate limit exceeded. Maximum 60 messages per minute.");
    }

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify membership
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    if (!membership) return ApiErrors.forbidden("Not a member of this conversation");

    // Check announcement-only restriction
    const { data: conv } = await serverFromTable(admin!, "conversations")
        .select("is_announcement_only, organization_id")
        .eq("id", conversationId)
        .single();

    const convRecord = conv as Record<string, unknown> | null;
    const memberRole = (membership as Record<string, unknown>).role as string;

    if (convRecord?.is_announcement_only && !["owner", "admin"].includes(memberRole)) {
        return ApiErrors.forbidden("This is an announcement-only channel");
    }

    const parsed = await parseAndValidate(request, sendMessageSchema);
    if (!parsed.success) return parsed.response;

    const {
        body,
        body_html,
        parent_message_id,
        mentioned_user_ids,
        attachments,
        is_internal,
        priority,
        is_mandatory_read,
        scheduled_at,
    } = parsed.data;

    // Insert message
    const { data: message, error } = await serverFromTable(admin!, "messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            parent_message_id: parent_message_id ?? null,
            body,
            body_html: body_html ?? null,
            mentioned_user_ids: mentioned_user_ids ?? [],
            attachments: attachments ?? [],
            is_internal: is_internal ?? false,
            priority: priority ?? "normal",
            is_mandatory_read: is_mandatory_read ?? false,
            scheduled_at: scheduled_at ?? null,
            organization_id: (convRecord?.organization_id as string) ?? null,
        })
        .select("*, user_profiles:sender_id(id, display_name, avatar_url)")
        .single();

    if (error) {
        logger.error("[POST /api/conversations/[id]/messages] insert failed", { error });
        return ApiErrors.internalError("Failed to send message");
    }

    // Dispatch notifications for @mentions (async, non-blocking)
    if (mentioned_user_ids && mentioned_user_ids.length > 0) {
        const senderProfile = (message as Record<string, unknown>).user_profiles as {
            display_name: string;
        } | null;
        const senderName = senderProfile?.display_name ?? "Someone";

        // Fire and forget — notification dispatch
        for (const mentionedUserId of mentioned_user_ids) {
            if (mentionedUserId === user.id) continue;
            fetch(new URL("/api/notifications/dispatch", request.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: mentionedUserId,
                    title: `${senderName} mentioned you`,
                    body: body.slice(0, 200),
                    type: "mention",
                    action_url: `/messages?c=${conversationId}`,
                    organization_id: convRecord?.organization_id,
                }),
            }).catch(() => {
                // Best-effort notification dispatch
            });
        }
    }

    // Create mandatory read acknowledgments if needed
    if (is_mandatory_read) {
        const { data: members } = await serverFromTable(admin!, "conversation_members")
            .select("user_id")
            .eq("conversation_id", conversationId)
            .neq("user_id", user.id);

        if (members && members.length > 0) {
            const ackRows = (members as Record<string, unknown>[]).map((m) => ({
                message_id: (message as Record<string, unknown>).id as string,
                user_id: m.user_id as string,
            }));
            await serverFromTable(admin!, "mandatory_read_acknowledgments").insert(ackRows);
        }
    }

    return NextResponse.json({ data: message }, { status: 201 });
}
