import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";

const addMembersSchema = z.object({
    member_ids: z.array(z.string().uuid()).min(1),
});

const removeMemberSchema = z.object({
    user_id: z.string().uuid(),
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id]/members
 * List members of a conversation.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify caller is a member
    const { data: callerMembership } = await serverFromTable(admin!, "conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    if (!callerMembership) return ApiErrors.forbidden("Not a member of this conversation");

    const { data: members, error } = await serverFromTable(admin!, "conversation_members")
        .select("*, profiles:user_id(id, name, avatar_url, email)")
        .eq("conversation_id", conversationId)
        .order("joined_at", { ascending: true });

    if (error) return ApiErrors.internalError("Failed to fetch members");

    const enriched = (members as Record<string, unknown>[] | null)?.map((m) => {
        const profile = m.profiles as {
            id: string;
            name: string;
            avatar_url: string | null;
            email: string;
        } | null;
        return {
            id: m.id,
            conversation_id: m.conversation_id,
            user_id: m.user_id,
            role: m.role,
            last_read_at: m.last_read_at,
            notification_preference: m.notification_preference,
            is_muted: m.is_muted,
            is_pinned: m.is_pinned,
            joined_at: m.joined_at,
            profile: profile
                ? {
                      id: profile.id,
                      name: profile.name,
                      avatar_url: profile.avatar_url,
                      email: profile.email,
                  }
                : null,
        };
    }) ?? [];

    return NextResponse.json({ data: enriched });
}

/**
 * POST /api/conversations/[id]/members
 * Add members to a conversation (owner/admin only).
 */
export async function POST(request: NextRequest, context: RouteContext) {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify caller is owner/admin
    const { data: callerMembership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    const callerRole = (callerMembership as Record<string, unknown> | null)?.role as string | null;
    if (!callerRole || !["owner", "admin"].includes(callerRole)) {
        return ApiErrors.forbidden("Only owners or admins can add members");
    }

    const parsed = await parseAndValidate(request, addMembersSchema);
    if (!parsed.success) return parsed.response;

    const rows = parsed.data.member_ids.map((uid) => ({
        conversation_id: conversationId,
        user_id: uid,
        role: "member",
    }));

    const { error } = await serverFromTable(admin!, "conversation_members")
        .upsert(rows, { onConflict: "conversation_id,user_id" });

    if (error) {
        logger.error("[POST /api/conversations/[id]/members] insert failed", { error });
        return ApiErrors.internalError("Failed to add members");
    }

    // Post system message
    const { data: conv } = await serverFromTable(admin!, "conversations")
        .select("organization_id")
        .eq("id", conversationId)
        .single();

    await serverFromTable(admin!, "messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body: `Added ${parsed.data.member_ids.length} member(s) to the conversation`,
        is_system_message: true,
        organization_id: (conv as Record<string, unknown> | null)?.organization_id as string ?? null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * DELETE /api/conversations/[id]/members
 * Remove a member from a conversation (owner/admin or self).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const parsed = await parseAndValidate(request, removeMemberSchema);
    if (!parsed.success) return parsed.response;

    const targetUserId = parsed.data.user_id;

    // Allow self-removal or owner/admin removal
    if (targetUserId !== user.id) {
        const { data: callerMembership } = await serverFromTable(admin!, "conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        const callerRole = (callerMembership as Record<string, unknown> | null)?.role as string | null;
        if (!callerRole || !["owner", "admin"].includes(callerRole)) {
            return ApiErrors.forbidden("Only owners or admins can remove other members");
        }
    }

    const { error } = await serverFromTable(admin!, "conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", targetUserId);

    if (error) {
        logger.error("[DELETE /api/conversations/[id]/members] delete failed", { error });
        return ApiErrors.internalError("Failed to remove member");
    }

    return NextResponse.json({ success: true });
}
