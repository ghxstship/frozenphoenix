import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/messages/[id]/pin
 * Pin a message (conversation owner/admin only).
 */
export async function POST(_request: NextRequest, context: RouteContext) {
    const { id: messageId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Get message and its conversation
    const { data: msg } = await serverFromTable(admin!, "messages")
        .select("id, conversation_id")
        .eq("id", messageId)
        .is("deleted_at", null)
        .single();

    if (!msg) return ApiErrors.notFound("Message");
    const conversationId = (msg as Record<string, unknown>).conversation_id as string | null;
    if (!conversationId) return ApiErrors.badRequest("Message is not in a conversation");

    // Verify caller is owner/admin of the conversation
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    const role = (membership as Record<string, unknown> | null)?.role as string | null;
    if (!role || !["owner", "admin"].includes(role)) {
        return ApiErrors.forbidden("Only conversation owners or admins can pin messages");
    }

    const { error } = await serverFromTable(admin!, "messages")
        .update({
            is_pinned: true,
            pinned_by: user.id,
            pinned_at: new Date().toISOString(),
        })
        .eq("id", messageId);

    if (error) {
        logger.error("[POST /api/messages/[id]/pin] update failed", { error });
        return ApiErrors.internalError("Failed to pin message");
    }

    return NextResponse.json({ success: true });
}

/**
 * DELETE /api/messages/[id]/pin
 * Unpin a message (conversation owner/admin only).
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
    const { id: messageId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Get message and its conversation
    const { data: msg } = await serverFromTable(admin!, "messages")
        .select("id, conversation_id")
        .eq("id", messageId)
        .single();

    if (!msg) return ApiErrors.notFound("Message");
    const conversationId = (msg as Record<string, unknown>).conversation_id as string | null;
    if (!conversationId) return ApiErrors.badRequest("Message is not in a conversation");

    // Verify caller is owner/admin
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

    const role = (membership as Record<string, unknown> | null)?.role as string | null;
    if (!role || !["owner", "admin"].includes(role)) {
        return ApiErrors.forbidden("Only conversation owners or admins can unpin messages");
    }

    const { error } = await serverFromTable(admin!, "messages")
        .update({
            is_pinned: false,
            pinned_by: null,
            pinned_at: null,
        })
        .eq("id", messageId);

    if (error) {
        logger.error("[DELETE /api/messages/[id]/pin] update failed", { error });
        return ApiErrors.internalError("Failed to unpin message");
    }

    return NextResponse.json({ success: true });
}
