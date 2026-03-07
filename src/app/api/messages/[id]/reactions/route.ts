import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const reactionSchema = z.object({
    emoji: z.string().min(1).max(10),
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/messages/[id]/reactions
 * Add a reaction to a message.
 */
export async function POST(request: NextRequest, context: RouteContext) {
    const { id: messageId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    // Verify message exists
    const { data: msg } = await serverFromTable(admin!, "messages")
        .select("id")
        .eq("id", messageId)
        .is("deleted_at", null)
        .single();
    if (!msg) return ApiErrors.notFound("Message");

    const parsed = await parseAndValidate(request, reactionSchema);
    if (!parsed.success) return parsed.response;

    const { error } = await serverFromTable(admin!, "message_reactions")
        .upsert(
            {
                message_id: messageId,
                user_id: user.id,
                emoji: parsed.data.emoji,
            },
            { onConflict: "message_id,user_id,emoji" }
        );

    if (error) {
        logger.error("[POST /api/messages/[id]/reactions] upsert failed", { error });
        return ApiErrors.internalError("Failed to add reaction");
    }

    return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * DELETE /api/messages/[id]/reactions
 * Remove a reaction from a message.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id: messageId } = await context.params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const admin = createAdminClient();
    if (!admin) return ApiErrors.serviceUnavailable();

    const parsed = await parseAndValidate(request, reactionSchema);
    if (!parsed.success) return parsed.response;

    const { error } = await serverFromTable(admin!, "message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", parsed.data.emoji);

    if (error) {
        logger.error("[DELETE /api/messages/[id]/reactions] delete failed", { error });
        return ApiErrors.internalError("Failed to remove reaction");
    }

    return NextResponse.json({ success: true });
}
