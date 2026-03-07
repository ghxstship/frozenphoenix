/**
 * Edge Function: send-scheduled-messages
 * Invoked via Supabase cron (pg_cron) every minute to deliver
 * messages whose scheduled_for timestamp has passed.
 *
 * Flow:
 *   1. Query messages WHERE scheduled_for <= NOW() AND deleted_at IS NULL
 *   2. For each message, insert into the conversation timeline
 *      (clear scheduled_for so it becomes a normal message)
 *   3. Parse @mentions and dispatch notifications
 *   4. Return summary of processed messages
 *
 * Cron config (add to supabase/config.toml or via SQL):
 *   SELECT cron.schedule(
 *     'send-scheduled-messages',
 *     '* * * * *',
 *     $$ SELECT net.http_post(
 *       url := '<SUPABASE_URL>/functions/v1/send-scheduled-messages',
 *       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
 *     ) $$
 *   );
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MENTION_REGEX = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g;

function parseMentions(body: string): string[] {
    const ids: string[] = [];
    let match;
    while ((match = MENTION_REGEX.exec(body)) !== null) {
        if (match[2]) ids.push(match[2]);
    }
    return ids;
}

Deno.serve(async (req: Request) => {
    // Only allow POST (from cron) or GET (for health checks)
    if (req.method !== "POST" && req.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
        // Find all messages scheduled for delivery
        const { data: scheduledMessages, error: fetchError } = await supabase
            .from("messages")
            .select("id, conversation_id, sender_id, body, mentioned_user_ids, entity_type, entity_id")
            .lte("scheduled_for", new Date().toISOString())
            .is("deleted_at", null)
            .limit(100);

        if (fetchError) {
            console.error("Failed to fetch scheduled messages:", fetchError);
            return new Response(
                JSON.stringify({ error: "Failed to fetch scheduled messages", details: fetchError.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!scheduledMessages || scheduledMessages.length === 0) {
            return new Response(
                JSON.stringify({ processed: 0, message: "No scheduled messages to send" }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        let processed = 0;
        let failed = 0;
        const errors: Array<{ messageId: string; error: string }> = [];

        for (const msg of scheduledMessages) {
            // Clear scheduled_for to make it a live message
            const { error: updateError } = await supabase
                .from("messages")
                .update({
                    scheduled_for: null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", msg.id);

            if (updateError) {
                console.error(`Failed to deliver message ${msg.id}:`, updateError);
                errors.push({ messageId: msg.id, error: updateError.message });
                failed++;
                continue;
            }

            // Update conversation's last_message_at
            if (msg.conversation_id) {
                await supabase
                    .from("conversations")
                    .update({ last_message_at: new Date().toISOString() })
                    .eq("id", msg.conversation_id);
            }

            // Parse mentions from body and dispatch notifications
            const mentionedIds = [
                ...new Set([
                    ...(msg.mentioned_user_ids ?? []),
                    ...parseMentions(msg.body ?? ""),
                ]),
            ];

            if (mentionedIds.length > 0) {
                // Create notifications for each mentioned user
                const notifications = mentionedIds
                    .filter((uid: string) => uid !== msg.sender_id)
                    .map((uid: string) => ({
                        user_id: uid,
                        type: "mention",
                        title: "You were mentioned in a message",
                        body: (msg.body ?? "").substring(0, 200),
                        resource_type: "message",
                        resource_id: msg.id,
                        metadata: {
                            conversation_id: msg.conversation_id,
                            sender_id: msg.sender_id,
                        },
                    }));

                if (notifications.length > 0) {
                    const { error: notifError } = await supabase
                        .from("notifications")
                        .insert(notifications);

                    if (notifError) {
                        console.warn(`Failed to create mention notifications for message ${msg.id}:`, notifError);
                    }
                }
            }

            processed++;
        }

        return new Response(
            JSON.stringify({
                processed,
                failed,
                total: scheduledMessages.length,
                errors: errors.length > 0 ? errors : undefined,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("Unexpected error in send-scheduled-messages:", err);
        return new Response(
            JSON.stringify({ error: "Internal error", details: String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
