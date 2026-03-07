import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";

const markReadSchema = z.object({
    conversation_id: z.string().uuid(),
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/messages/[id]/read
 * Mark a message as read and update the conversation membership's last_read_at.
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

    const parsed = await parseAndValidate(request, markReadSchema);
    if (!parsed.success) return parsed.response;

    const { conversation_id } = parsed.data;

    // Get message timestamp
    const { data: msg } = await serverFromTable(admin!, "messages")
        .select("created_at")
        .eq("id", messageId)
        .single();

    if (!msg) return ApiErrors.notFound("Message");

    const messageCreatedAt = (msg as Record<string, unknown>).created_at as string;

    // Update read receipt
    await serverFromTable(admin!, "message_read_receipts").upsert(
        {
            message_id: messageId,
            user_id: user.id,
            read_at: new Date().toISOString(),
        },
        { onConflict: "message_id,user_id" }
    );

    // Update conversation membership last_read
    await serverFromTable(admin!, "conversation_members")
        .update({
            last_read_at: messageCreatedAt,
            last_read_message_id: messageId,
        })
        .eq("conversation_id", conversation_id)
        .eq("user_id", user.id);

    return NextResponse.json({ success: true });
}
