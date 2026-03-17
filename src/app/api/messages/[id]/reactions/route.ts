import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

const reactionSchema = z.object({
    emoji: z.string().min(1).max(10),
});

/**
 * POST /api/messages/[id]/reactions
 * Add a reaction to a message.
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/messages/[id]/reactions",
        mutation: true,
        rbac: { resource: "messages", action: "write" },
    },
    async (request, { user, log }, { params }) => {
        const { id: messageId } = await params;

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

        const { error } = await serverFromTable(admin!, "message_reactions").upsert(
            {
                message_id: messageId,
                user_id: user.id,
                emoji: parsed.data.emoji,
            },
            { onConflict: "message_id,user_id,emoji" }
        );

        if (error) {
            log.error("[POST /api/messages/[id]/reactions] upsert failed", { error });
            return ApiErrors.internalError("Failed to add reaction");
        }

        return NextResponse.json({ success: true }, { status: 201 });
    }
);

/**
 * DELETE /api/messages/[id]/reactions
 * Remove a reaction from a message.
 */
export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/messages/[id]/reactions",
        mutation: true,
        rbac: { resource: "messages", action: "write" },
    },
    async (request, { user, log }, { params }) => {
        const { id: messageId } = await params;

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
            log.error("[DELETE /api/messages/[id]/reactions] delete failed", { error });
            return ApiErrors.internalError("Failed to remove reaction");
        }

        return NextResponse.json({ success: true });
    }
);
