import { createServiceClient, errorResponse, jsonResponse } from "../_shared/webhook-utils.ts";

/**
 * incident-to-thread Edge Function
 * When an incident is created, automatically posts a message to the
 * event's safety channel and starts a thread for the incident.
 *
 * Trigger: webhook from incidents table insert or manual invocation.
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const body = await req.json();
        const { incident_id } = body as { incident_id?: string };

        if (!incident_id) {
            return errorResponse("incident_id is required", 400);
        }

        const supabase = createServiceClient();

        // Get incident details
        const { data: incident, error: incidentErr } = await supabase
            .from("incidents")
            .select("id, title, description, severity, event_id, reported_by, status")
            .eq("id", incident_id)
            .single();

        if (incidentErr || !incident) {
            return errorResponse("Incident not found", 404);
        }

        if (!incident.event_id) {
            return jsonResponse({ skipped: true, reason: "Incident has no linked event" });
        }

        // Find the safety channel for this event
        const { data: safetyChannel } = await supabase
            .from("conversations")
            .select("id")
            .eq("event_id", incident.event_id)
            .eq("category", "safety")
            .eq("type", "channel")
            .eq("is_archived", false)
            .limit(1)
            .single();

        if (!safetyChannel) {
            // Fall back to general channel
            const { data: generalChannel } = await supabase
                .from("conversations")
                .select("id")
                .eq("event_id", incident.event_id)
                .eq("category", "general")
                .eq("type", "channel")
                .eq("is_archived", false)
                .limit(1)
                .single();

            if (!generalChannel) {
                return jsonResponse({ skipped: true, reason: "No safety or general channel found for event" });
            }

            // Use general channel
            const result = await createIncidentThread(supabase, generalChannel.id, incident);
            return jsonResponse(result);
        }

        const result = await createIncidentThread(supabase, safetyChannel.id, incident);
        return jsonResponse(result);
    } catch (err) {
        console.error("incident-to-thread error:", err);
        return errorResponse("Internal server error", 500);
    }
});

async function createIncidentThread(
    supabase: ReturnType<typeof createServiceClient>,
    channelId: string,
    incident: {
        id: string;
        title: string;
        description: string | null;
        severity: string | null;
        reported_by: string | null;
        status: string | null;
    }
) {
    const severityEmoji: Record<string, string> = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
    };

    const emoji = severityEmoji[incident.severity ?? "medium"] ?? "⚠️";

    // Create the parent message
    const { data: parentMessage, error: msgErr } = await supabase
        .from("messages")
        .insert({
            conversation_id: channelId,
            body: `${emoji} **Incident Report: ${incident.title}**\nSeverity: ${incident.severity ?? "Unknown"}\nStatus: ${incident.status ?? "Open"}\n\n${incident.description ?? "No description provided."}`,
            is_system_message: true,
            entity_type: "incident",
            entity_id: incident.id,
            is_mandatory_read: incident.severity === "critical" || incident.severity === "high",
        })
        .select("id")
        .single();

    if (msgErr || !parentMessage) {
        console.error("Failed to create incident thread message:", msgErr);
        return { error: "Failed to create message", incident_id: incident.id };
    }

    // If mandatory read, create acknowledgment records for all channel members
    if (incident.severity === "critical" || incident.severity === "high") {
        const { data: members } = await supabase
            .from("conversation_members")
            .select("user_id")
            .eq("conversation_id", channelId);

        if (members && members.length > 0) {
            const acks = members.map((m) => ({
                message_id: parentMessage.id,
                user_id: m.user_id,
            }));

            await supabase.from("mandatory_read_acknowledgments").insert(acks);
        }
    }

    return {
        success: true,
        message_id: parentMessage.id,
        channel_id: channelId,
        incident_id: incident.id,
        is_mandatory: incident.severity === "critical" || incident.severity === "high",
    };
}
