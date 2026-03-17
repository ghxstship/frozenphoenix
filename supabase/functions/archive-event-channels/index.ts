import {
    createServiceClient,
    errorResponse,
    jsonResponse,
    requireServiceRoleAuth,
} from "../_shared/webhook-utils.ts";

/**
 * archive-event-channels Edge Function
 * Triggered by cron or event status change.
 * Archives ephemeral channels whose auto_archive_at has passed,
 * or whose linked event has completed.
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const authError = requireServiceRoleAuth(req);
        if (authError) return authError;

        const supabase = createServiceClient();

        // Find ephemeral channels past their archive date
        const { data: expiredChannels, error: expiredErr } = await supabase
            .from("conversations")
            .select("id, name, event_id")
            .eq("is_ephemeral", true)
            .eq("is_archived", false)
            .lte("auto_archive_at", new Date().toISOString())
            .not("auto_archive_at", "is", null);

        if (expiredErr) {
            console.error("Error fetching expired channels:", expiredErr);
            return errorResponse("Failed to fetch expired channels", 500);
        }

        // Find channels linked to completed events
        const { data: completedEventChannels, error: completedErr } = await supabase
            .from("conversations")
            .select("id, name, event_id, live_event_instances!inner(id, status)")
            .eq("is_ephemeral", true)
            .eq("is_archived", false)
            .not("event_id", "is", null)
            .in("live_event_instances.status", ["completed", "cancelled"]);

        if (completedErr) {
            console.error("Error fetching completed event channels:", completedErr);
        }

        const channelsToArchive = [...(expiredChannels ?? []), ...(completedEventChannels ?? [])];

        // Deduplicate by ID
        const uniqueIds = [...new Set(channelsToArchive.map((c) => c.id))];

        if (uniqueIds.length === 0) {
            return jsonResponse({ archived: 0, message: "No channels to archive" });
        }

        // Archive channels
        const { error: archiveErr } = await supabase
            .from("conversations")
            .update({
                is_archived: true,
                updated_at: new Date().toISOString(),
            })
            .in("id", uniqueIds);

        if (archiveErr) {
            console.error("Error archiving channels:", archiveErr);
            return errorResponse("Failed to archive channels", 500);
        }

        // Send system message to each archived channel
        for (const channelId of uniqueIds) {
            await supabase.from("messages").insert({
                conversation_id: channelId,
                body: "📦 This channel has been automatically archived.",
                is_system_message: true,
            });
        }

        console.log(`Archived ${uniqueIds.length} ephemeral channels`);
        return jsonResponse({ archived: uniqueIds.length, channel_ids: uniqueIds });
    } catch (err) {
        console.error("archive-event-channels error:", err);
        return errorResponse("Internal server error", 500);
    }
});
