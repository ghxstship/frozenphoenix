import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const createConversationSchema = z.object({
    type: z.enum(["dm", "group", "channel"]),
    name: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    slug: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
        .optional(),
    is_public: z.boolean().optional(),
    is_announcement_only: z.boolean().optional(),
    category: z.string().max(50).optional(),
    event_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    member_ids: z.array(z.string().uuid()).min(1, "At least one member is required"),
});

/**
 * GET /api/conversations
 * List conversations for the authenticated user.
 */
export async function GET() {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Get conversations user is a member of
    const { data: memberships, error: memErr } = await serverFromTable(admin!, "conversation_members")
        .select("conversation_id, last_read_at, is_muted, is_pinned, role, notification_preference")
        .eq("user_id", user.id);

    if (memErr) return ApiErrors.internalError("Failed to fetch memberships");
    if (!memberships || memberships.length === 0) {
        return NextResponse.json({ data: [] });
    }

    const convIds = (memberships as Record<string, unknown>[]).map(
        (m) => m.conversation_id as string
    );

    const { data: conversations, error: convErr } = await serverFromTable(admin!, "conversations")
        .select("*")
        .in("id", convIds)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false, nullsFirst: false });

    if (convErr) return ApiErrors.internalError("Failed to fetch conversations");

    // For each conversation, get last message and unread count
    const enriched = await Promise.all(
        (conversations as Record<string, unknown>[]).map(async (conv) => {
            const membership = (memberships as Record<string, unknown>[]).find(
                (m) => m.conversation_id === conv.id
            );
            const lastReadAt = membership?.last_read_at as string | null;

            // Unread count
            let unreadCount = 0;
            if (lastReadAt) {
                const { count } = await serverFromTable(admin!, "messages")
                    .select("id", { count: "exact", head: true })
                    .eq("conversation_id", conv.id as string)
                    .gt("created_at", lastReadAt)
                    .is("deleted_at", null);
                unreadCount = count ?? 0;
            } else {
                const { count } = await serverFromTable(admin!, "messages")
                    .select("id", { count: "exact", head: true })
                    .eq("conversation_id", conv.id as string)
                    .is("deleted_at", null);
                unreadCount = count ?? 0;
            }

            // Last message
            const { data: lastMsgs } = await serverFromTable(admin!, "messages")
                .select("id, body, sender_id, created_at, is_system_message, profiles:sender_id(name)")
                .eq("conversation_id", conv.id as string)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(1);

            const lastMsg = (lastMsgs as Record<string, unknown>[] | null)?.[0] ?? null;
            const lastMessage = lastMsg
                ? {
                      id: lastMsg.id as string,
                      body: ((lastMsg.body as string) ?? "").slice(0, 100),
                      sender_name:
                          (lastMsg.profiles as { name: string } | null)?.name ?? "Unknown",
                      sender_id: lastMsg.sender_id as string | null,
                      created_at: lastMsg.created_at as string,
                      is_system_message: (lastMsg.is_system_message as boolean) ?? false,
                  }
                : null;

            // Members preview (max 5)
            const { data: members } = await serverFromTable(admin!, "conversation_members")
                .select("user_id, role, profiles:user_id(name, avatar_url)")
                .eq("conversation_id", conv.id as string)
                .limit(5);

            const memberPreviews = (members as Record<string, unknown>[] | null)?.map((m) => {
                const p = m.profiles as { name: string; avatar_url: string | null } | null;
                return {
                    user_id: m.user_id as string,
                    name: p?.name ?? "Unknown",
                    avatar_url: p?.avatar_url ?? null,
                    role: m.role as string,
                };
            }) ?? [];

            return {
                ...conv,
                unread_count: unreadCount,
                last_message: lastMessage,
                members: memberPreviews,
                my_membership: membership ?? null,
            };
        })
    );

    return NextResponse.json({ data: enriched });
}

/**
 * POST /api/conversations
 * Create a new conversation (DM, group, or channel).
 * For DMs: finds existing 1:1 if it exists.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const parsed = await parseAndValidate(request, createConversationSchema);
    if (!parsed.success) return parsed.response;

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const { type, name, description, slug, is_public, is_announcement_only, category, event_id, project_id, member_ids } = parsed.data;

    // Get user's org
    const { data: profile } = await serverFromTable(admin!, "profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
    const orgId = (profile as Record<string, unknown> | null)?.organization_id as string | null;
    if (!orgId) return ApiErrors.forbidden("User is not in an organization");

    // For DMs: check if 1:1 conversation already exists
    if (type === "dm" && member_ids.length === 1) {
        const otherUserId = member_ids[0]!;

        // Find existing DM between these two users
        const { data: existingConvs } = await serverFromTable(admin!, "conversation_members")
            .select("conversation_id")
            .eq("user_id", user.id);

        if (existingConvs && existingConvs.length > 0) {
            const myConvIds = (existingConvs as Record<string, unknown>[]).map(
                (c) => c.conversation_id as string
            );

            const { data: otherConvs } = await serverFromTable(admin!, "conversation_members")
                .select("conversation_id")
                .eq("user_id", otherUserId)
                .in("conversation_id", myConvIds);

            if (otherConvs && otherConvs.length > 0) {
                // Check if any shared conversation is a DM
                const sharedConvIds = (otherConvs as Record<string, unknown>[]).map(
                    (c) => c.conversation_id as string
                );

                const { data: existingDm } = await serverFromTable(admin!, "conversations")
                    .select("*")
                    .in("id", sharedConvIds)
                    .eq("type", "dm")
                    .eq("is_archived", false)
                    .limit(1)
                    .single();

                if (existingDm) {
                    return NextResponse.json({ data: existingDm });
                }
            }
        }
    }

    // Create conversation
    const { data: conversation, error: convErr } = await serverFromTable(admin!, "conversations")
        .insert({
            organization_id: orgId,
            type,
            name: name?.trim() ?? null,
            description: description?.trim() ?? null,
            slug: slug ?? null,
            is_public: is_public ?? (type === "channel"),
            is_announcement_only: is_announcement_only ?? false,
            category: category ?? null,
            event_id: event_id ?? null,
            project_id: project_id ?? null,
            created_by: user.id,
        })
        .select("*")
        .single();

    if (convErr) {
        if (convErr.code === "23505") {
            return ApiErrors.conflict("A conversation with this slug already exists in this organization");
        }
        logger.error("[POST /api/conversations] insert failed", { error: convErr });
        return ApiErrors.internalError("Failed to create conversation");
    }

    // Add creator as owner
    const allMemberIds = [user.id, ...member_ids.filter((id) => id !== user.id)];
    const memberRows = allMemberIds.map((id, i) => ({
        conversation_id: (conversation as Record<string, unknown>).id as string,
        user_id: id,
        role: i === 0 ? "owner" : "member",
    }));

    const { error: memErr } = await serverFromTable(admin!, "conversation_members").insert(memberRows);
    if (memErr) {
        logger.error("[POST /api/conversations] members insert failed", { error: memErr });
    }

    return NextResponse.json({ data: conversation }, { status: 201 });
}
