import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/mentions/notify
 *
 * Gap #17: @Mention notification dispatch
 * Parses @mentions from message/comment body and creates notifications for mentioned users.
 *
 * Body: { body: string, entity_type?: string, entity_id?: string, conversation_id?: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/mentions/notify",
        mutation: true,
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { body: messageBody, entity_type, entity_id, conversation_id } = body;

        if (!messageBody) {
            return ApiErrors.badRequest("body is required");
        }

        // Parse @mentions — matches @username or @"Display Name" patterns
        const mentionPattern = /@(\w+)|@"([^"]+)"/g;
        const mentions: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = mentionPattern.exec(messageBody)) !== null) {
            mentions.push(match[1] ?? match[2] ?? "");
        }

        if (mentions.length === 0) {
            return NextResponse.json({ data: { notified: 0 } });
        }

        // Resolve mentioned users by display_name or email prefix
        const notified: string[] = [];
        for (const mention of mentions) {
            const { data: mentionedUser } = await serverFromTable(supabase, "user_profiles")
                .select("id, display_name, email")
                .or(`display_name.ilike.%${mention}%,email.ilike.${mention}%`)
                .limit(1)
                .single();

            if (mentionedUser && (mentionedUser as Record<string, unknown>).id !== user.id) {
                const userId = (mentionedUser as Record<string, unknown>).id as string;
                const actionUrl =
                    entity_type && entity_id
                        ? `/${entity_type}/${entity_id}`
                        : conversation_id
                          ? `/messages?conversation=${conversation_id}`
                          : "/notifications";

                await serverFromTable(supabase, "notifications").insert({
                    user_id: userId,
                    type: "mention",
                    title: "You were mentioned",
                    message: `${user.email ?? "Someone"} mentioned you: "${messageBody.slice(0, 100)}${messageBody.length > 100 ? "…" : ""}"`,
                    action_url: actionUrl,
                    entity_type: entity_type ?? null,
                    entity_id: entity_id ?? null,
                    organization_id: orgId,
                });
                notified.push(userId);
            }
        }

        return NextResponse.json({ data: { notified: notified.length, user_ids: notified } });
    }
);
