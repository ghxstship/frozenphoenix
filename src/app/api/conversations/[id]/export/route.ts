import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: conversationId } = await params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

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
        .select("id, body, priority, created_at, edited_at, is_pinned, profiles:sender_id(name)")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    if (error) {
        logger.error("[GET /api/conversations/[id]/export]", { error });
        return ApiErrors.internalError("Failed to export conversation");
    }

    const rows = (messages ?? []).map((msg: Record<string, unknown>) => {
        const raw = msg as Record<string, unknown>;
        const sender = raw.profiles as { name: string } | null;
        return {
            timestamp: raw.created_at as string,
            sender: sender?.name ?? "System",
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
        const csvRows = rows.map((r: { timestamp: string; sender: string; message: string; type: string; pinned: string; edited: string }) =>
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
