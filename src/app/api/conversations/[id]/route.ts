import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

const updateConversationSchema = z.object({
    name: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    is_public: z.boolean().optional(),
    is_announcement_only: z.boolean().optional(),
    is_archived: z.boolean().optional(),
    category: z.string().max(50).optional(),
});

/**
 * GET /api/conversations/[id]
 * Get a single conversation by ID.
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/conversations/[id]",
        rbac: { resource: "conversations", action: "read" },
    },
    async (_request, { user }, { params }) => {
        const { id } = await params;

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
                .select(
                    "id, organization_id, type, name, slug, description, is_public, is_announcement_only, is_archived, category, event_id, project_id, created_by, last_message_at, created_at"
                )
                .eq("id", id)
                .eq("is_public", true)
                .single();
            if (!conv) return ApiErrors.notFound("Conversation");
            return NextResponse.json({ data: conv });
        }

        const { data: conversation, error } = await serverFromTable(admin!, "conversations")
            .select(
                "id, organization_id, type, name, slug, description, is_public, is_announcement_only, is_archived, category, event_id, project_id, created_by, last_message_at, created_at"
            )
            .eq("id", id)
            .single();

        if (error || !conversation) return ApiErrors.notFound("Conversation");
        return NextResponse.json({ data: conversation });
    }
);

/**
 * PATCH /api/conversations/[id]
 * Update a conversation (owner/admin only).
 */
export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/conversations/[id]",
        mutation: true,
        rbac: { resource: "conversations", action: "write" },
    },
    async (request, { user, log }, { params }) => {
        const { id } = await params;

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
            return ApiErrors.forbidden(
                "Only conversation owners or admins can update conversations"
            );
        }

        const parsed = await parseAndValidate(request, updateConversationSchema);
        if (!parsed.success) return parsed.response;

        const { data: updated, error } = await serverFromTable(admin!, "conversations")
            .update(parsed.data)
            .eq("id", id)
            .select(
                "id, organization_id, type, name, slug, description, is_public, is_announcement_only, is_archived, category, event_id, project_id, created_by, last_message_at, created_at"
            )
            .single();

        if (error) {
            log.error("[PATCH /api/conversations/[id]] update failed", { error });
            return ApiErrors.internalError("Failed to update conversation");
        }

        return NextResponse.json({ data: updated });
    }
);

/**
 * DELETE /api/conversations/[id]
 * Archive a conversation (owner only).
 */
export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/conversations/[id]",
        mutation: true,
        rbac: { resource: "conversations", action: "write" },
    },
    async (_request, { user, log }, { params }) => {
        const { id } = await params;

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
            log.error("[DELETE /api/conversations/[id]] archive failed", { error });
            return ApiErrors.internalError("Failed to archive conversation");
        }

        return NextResponse.json({ success: true });
    }
);
