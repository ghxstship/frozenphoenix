import { createServiceClient, errorResponse, jsonResponse } from "../_shared/webhook-utils.ts";

/**
 * cue-to-channel Edge Function
 * When a ROS (Run of Show) cue fires, posts an automated message
 * to the relevant production channel for the event.
 *
 * Trigger: webhook from cue status change or manual invocation.
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const body = await req.json();
        const { cue_id, event_id, cue_name, cue_type, department, notes } = body as {
            cue_id?: string;
            event_id?: string;
            cue_name?: string;
            cue_type?: string;
            department?: string;
            notes?: string;
        };

        if (!cue_id || !event_id) {
            return errorResponse("cue_id and event_id are required", 400);
        }

        const supabase = createServiceClient();

        // Find the appropriate channel — match by department/category, fall back to production
        let targetChannel = null;

        if (department) {
            const categoryMap: Record<string, string> = {
                lighting: "production",
                audio: "production",
                video: "production",
                staging: "production",
                logistics: "logistics",
                security: "safety",
                catering: "logistics",
                talent: "creative",
            };
            const category = categoryMap[department.toLowerCase()] ?? "production";

            const { data: channel } = await supabase
                .from("conversations")
                .select("id")
                .eq("event_id", event_id)
                .eq("category", category)
                .eq("type", "channel")
                .eq("is_archived", false)
                .limit(1)
                .single();

            targetChannel = channel;
        }

        // Fall back to production channel
        if (!targetChannel) {
            const { data: prodChannel } = await supabase
                .from("conversations")
                .select("id")
                .eq("event_id", event_id)
                .eq("category", "production")
                .eq("type", "channel")
                .eq("is_archived", false)
                .limit(1)
                .single();

            targetChannel = prodChannel;
        }

        // Fall back to general channel
        if (!targetChannel) {
            const { data: generalChannel } = await supabase
                .from("conversations")
                .select("id")
                .eq("event_id", event_id)
                .eq("category", "general")
                .eq("type", "channel")
                .eq("is_archived", false)
                .limit(1)
                .single();

            targetChannel = generalChannel;
        }

        if (!targetChannel) {
            return jsonResponse({ skipped: true, reason: "No channel found for event" });
        }

        // Build cue message
        const typeEmoji: Record<string, string> = {
            go: "🟢",
            standby: "🟡",
            warning: "🟠",
            stop: "🔴",
            info: "ℹ️",
        };
        const emoji = typeEmoji[cue_type?.toLowerCase() ?? "info"] ?? "🎬";

        const messageBody = [
            `${emoji} **Cue: ${cue_name ?? "Unnamed"}**`,
            cue_type ? `Type: ${cue_type}` : null,
            department ? `Department: ${department}` : null,
            notes ? `\n${notes}` : null,
        ]
            .filter(Boolean)
            .join("\n");

        const { data: message, error: msgErr } = await supabase
            .from("messages")
            .insert({
                conversation_id: targetChannel.id,
                body: messageBody,
                message_type: "system",
                cue_id,
            })
            .select("id")
            .single();

        if (msgErr) {
            console.error("Failed to post cue message:", msgErr);
            return errorResponse("Failed to post message", 500);
        }

        return jsonResponse({
            success: true,
            message_id: message?.id,
            channel_id: targetChannel.id,
            cue_id,
        });
    } catch (err) {
        console.error("cue-to-channel error:", err);
        return errorResponse("Internal server error", 500);
    }
});
