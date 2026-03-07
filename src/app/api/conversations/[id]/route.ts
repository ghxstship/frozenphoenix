import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateConversationSchema = z.object({
    name: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    is_public: z.boolean().optional(),
    is_announcement_only: z.boolean().optional(),
    is_archived: z.boolean().optional(),
    category: z.string().max(50).optional(),
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id]
 * Get a single conversation by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
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
        .select("role")
        .eq("conversation_id", id)
        .eq("user_id", user.id)
        .single();

    if (!membership) {
        // Check if public
        const { data: conv } = await serverFromTable(admin!, "conversations")
            .select("*")
            .eq("id", id)
            .eq("is_public", true)
            .single();
        if (!conv) return ApiErrors.notFound("Conversation");
        return NextResponse.json({ data: conv });
    }

    const { data: conversation, error } = await serverFromTable(admin!, "conversations")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !conversation) return ApiErrors.notFound("Conversation");
    return NextResponse.json({ data: conversation });
}

/**
 * PATCH /api/conversations/[id]
 * Update a conversation (owner/admin only).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify owner/admin role
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", id)
        .eq("user_id", user.id)
        .single();

    const role = (membership as Record<string, unknown> | null)?.role as string | null;
    if (!role || !["owner", "admin"].includes(role)) {
        return ApiErrors.forbidden("Only conversation owners or admins can update conversations");
    }

    const parsed = await parseAndValidate(request, updateConversationSchema);
    if (!parsed.success) return parsed.response;

    const { data: updated, error } = await serverFromTable(admin!, "conversations")
        .update(parsed.data)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        logger.error("[PATCH /api/conversations/[id]] update failed", { error });
        return ApiErrors.internalError("Failed to update conversation");
    }

    return NextResponse.json({ data: updated });
}

/**
 * DELETE /api/conversations/[id]
 * Archive a conversation (owner only).
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify owner role
    const { data: membership } = await serverFromTable(admin!, "conversation_members")
        .select("role")
        .eq("conversation_id", id)
        .eq("user_id", user.id)
        .single();

    const role = (membership as Record<string, unknown> | null)?.role as string | null;
    if (role !== "owner") {
        return ApiErrors.forbidden("Only the conversation owner can archive");
    }

    const { error } = await serverFromTable(admin!, "conversations")
        .update({ is_archived: true })
        .eq("id", id);

    if (error) {
        logger.error("[DELETE /api/conversations/[id]] archive failed", { error });
        return ApiErrors.internalError("Failed to archive conversation");
    }

    return NextResponse.json({ success: true });
}
