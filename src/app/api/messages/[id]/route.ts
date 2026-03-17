import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

const editMessageSchema = z.object({
    body: z.string().min(1).max(10000),
});

/**
 * PATCH /api/messages/[id]
 * Edit a message (sender only). Sets edited_at timestamp.
 */
export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/messages/[id]",
        mutation: true,
        rbac: { resource: "messages", action: "write" },
    },
    async (request, { user, log }, { params }) => {
        const { id: messageId } = await params;

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        // Verify ownership
        const { data: existing } = await serverFromTable(admin!, "messages")
            .select("sender_id")
            .eq("id", messageId)
            .is("deleted_at", null)
            .single();

        if (!existing) return ApiErrors.notFound("Message");
        if ((existing as Record<string, unknown>).sender_id !== user.id) {
            return ApiErrors.forbidden("You can only edit your own messages");
        }

        const parsed = await parseAndValidate(request, editMessageSchema);
        if (!parsed.success) return parsed.response;

        const { data: updated, error } = await serverFromTable(admin!, "messages")
            .update({
                body: parsed.data.body,
                edited_at: new Date().toISOString(),
            })
            .eq("id", messageId)
            .select("*")
            .single();

        if (error) {
            log.error("[PATCH /api/messages/[id]] update failed", { error });
            return ApiErrors.internalError("Failed to edit message");
        }

        return NextResponse.json({ data: updated });
    }
);

/**
 * DELETE /api/messages/[id]
 * Soft-delete a message (sender only). Sets deleted_at timestamp.
 */
export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/messages/[id]",
        mutation: true,
        rbac: { resource: "messages", action: "delete" },
    },
    async (_request, { user, log }, { params }) => {
        const { id: messageId } = await params;

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        // Verify ownership
        const { data: existing } = await serverFromTable(admin!, "messages")
            .select("sender_id")
            .eq("id", messageId)
            .is("deleted_at", null)
            .single();

        if (!existing) return ApiErrors.notFound("Message");
        if ((existing as Record<string, unknown>).sender_id !== user.id) {
            return ApiErrors.forbidden("You can only delete your own messages");
        }

        const { error } = await serverFromTable(admin!, "messages")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", messageId);

        if (error) {
            log.error("[DELETE /api/messages/[id]] soft-delete failed", { error });
            return ApiErrors.internalError("Failed to delete message");
        }

        return NextResponse.json({ success: true });
    }
);
