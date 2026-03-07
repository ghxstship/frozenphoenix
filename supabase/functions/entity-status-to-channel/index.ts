import { createServiceClient, errorResponse, jsonResponse } from "../_shared/webhook-utils.ts";

/**
 * entity-status-to-channel Edge Function
 * When an entity (project, event, activation, etc.) changes status,
 * posts an automated notification to relevant channels.
 *
 * Trigger: DB webhook on status column changes or manual invocation.
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const body = await req.json();
        const {
            entity_type,
            entity_id,
            old_status,
            new_status,
            entity_name,
            event_id,
            project_id,
            changed_by,
        } = body as {
            entity_type: string;
            entity_id: string;
            old_status?: string;
            new_status: string;
            entity_name?: string;
            event_id?: string;
            project_id?: string;
            changed_by?: string;
        };

        if (!entity_type || !entity_id || !new_status) {
            return errorResponse("entity_type, entity_id, and new_status are required", 400);
        }

        const supabase = createServiceClient();

        // Determine which channels to notify
        const channelIds: string[] = [];

        // If linked to an event, notify the event's production channel
        if (event_id) {
            const { data: eventChannels } = await supabase
                .from("conversations")
                .select("id, category")
                .eq("event_id", event_id)
                .eq("type", "channel")
                .eq("is_archived", false)
                .in("category", ["production", "general"]);

            if (eventChannels) {
                channelIds.push(...eventChannels.map((c) => c.id));
            }
        }

        // If linked to a project, notify project-scoped channels
        if (project_id) {
            const { data: projectChannels } = await supabase
                .from("conversations")
                .select("id")
                .eq("entity_type", "project")
                .eq("entity_id", project_id)
                .eq("type", "channel")
                .eq("is_archived", false);

            if (projectChannels) {
                channelIds.push(...projectChannels.map((c) => c.id));
            }
        }

        // Deduplicate
        const uniqueChannelIds = [...new Set(channelIds)];

        if (uniqueChannelIds.length === 0) {
            return jsonResponse({ skipped: true, reason: "No channels found for entity" });
        }

        // Build status change message
        const statusEmoji: Record<string, string> = {
            active: "🟢",
            in_progress: "🔵",
            completed: "✅",
            cancelled: "❌",
            on_hold: "⏸️",
            draft: "📝",
            review: "🔍",
            approved: "✅",
            rejected: "🚫",
            archived: "📦",
        };

        const emoji = statusEmoji[new_status.toLowerCase()] ?? "🔄";
        const displayName = entity_name ?? `${entity_type} ${entity_id.slice(0, 8)}`;

        let messageBody = `${emoji} **${displayName}** status changed`;
        if (old_status) {
            messageBody += `: ${old_status} → ${new_status}`;
        } else {
            messageBody += ` to **${new_status}**`;
        }

        // Get changer name if available
        if (changed_by) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", changed_by)
                .single();

            if (profile?.name) {
                messageBody += `\nChanged by: ${profile.name}`;
            }
        }

        // Post to all relevant channels
        const results = [];
        for (const channelId of uniqueChannelIds) {
            const { data: msg, error: msgErr } = await supabase
                .from("messages")
                .insert({
                    conversation_id: channelId,
                    body: messageBody,
                    message_type: "system",
                })
                .select("id")
                .single();

            results.push({
                channel_id: channelId,
                message_id: msg?.id ?? null,
                error: msgErr?.message ?? null,
            });
        }

        return jsonResponse({
            success: true,
            entity_type,
            entity_id,
            channels_notified: results.filter((r) => r.message_id).length,
            results,
        });
    } catch (err) {
        console.error("entity-status-to-channel error:", err);
        return errorResponse("Internal server error", 500);
    }
});
