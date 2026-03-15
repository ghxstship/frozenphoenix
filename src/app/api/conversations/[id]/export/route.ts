import { NextResponse } from "next/server";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/conversations/[id]/export",
        rbac: { resource: "messaging_export", action: "read" },
    },
    async (request, { user, log }, { params }) => {
        const { id: conversationId } = await params;

        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") ?? "csv";

        // Verify membership
        const { data: membership } = await serverFromTable(admin!, "conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return ApiErrors.forbidden("Not a member of this conversation");
        }

        // Get conversation details
        const { data: conversation } = await serverFromTable(admin!, "conversations")
            .select("name, type, category, created_at")
            .eq("id", conversationId)
            .single();

        // Get all messages
        const { data: messages, error } = await serverFromTable(admin!, "messages")
            .select(
                "id, body, priority, created_at, edited_at, is_pinned, user_profiles:sender_id(display_name)"
            )
            .eq("conversation_id", conversationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            log.error("[GET /api/conversations/[id]/export]", { error });
            return ApiErrors.internalError("Failed to export conversation");
        }

        const rows = (messages ?? []).map((msg: Record<string, unknown>) => {
            const raw = msg as Record<string, unknown>;
            const sender = raw.user_profiles as { display_name: string } | null;
            return {
                timestamp: raw.created_at as string,
                sender: sender?.display_name ?? "System",
                message: (raw.body as string).replace(/\n/g, " "),
                type: (raw.priority as string) ?? "normal",
                pinned: raw.is_pinned ? "Yes" : "No",
                edited: raw.edited_at ? "Yes" : "No",
            };
        });

        const convName = conversation?.name ?? "conversation";
        const safeFilename = convName.replace(/[^a-zA-Z0-9-_]/g, "_");

        if (format === "csv") {
            const header = "Timestamp,Sender,Message,Type,Pinned,Edited\n";
            const csvRows = rows.map(
                (r: {
                    timestamp: string;
                    sender: string;
                    message: string;
                    type: string;
                    pinned: string;
                    edited: string;
                }) =>
                    [
                        r.timestamp,
                        `"${r.sender.replace(/"/g, '""')}"`,
                        `"${r.message.replace(/"/g, '""')}"`,
                        r.type,
                        r.pinned,
                        r.edited,
                    ].join(",")
            );

            const csvContent = header + csvRows.join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${safeFilename}-export.csv"`,
                },
            });
        }

        // JSON export
        return NextResponse.json({
            conversation: {
                id: conversationId,
                name: conversation?.name,
                type: conversation?.type,
                category: conversation?.category,
                created_at: conversation?.created_at,
            },
            messages: rows,
            exported_at: new Date().toISOString(),
            exported_by: user.id,
            total_messages: rows.length,
        });
    }
);
