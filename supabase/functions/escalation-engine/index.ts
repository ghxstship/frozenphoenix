import { createServiceClient, errorResponse, jsonResponse } from "../_shared/webhook-utils.ts";

/**
 * escalation-engine Edge Function
 * Runs on a cron schedule to check for unacknowledged mandatory reads
 * and unread critical messages, then escalates per configured rules.
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const supabase = createServiceClient();

        // 1. Find active escalation rules
        const { data: rules, error: rulesErr } = await supabase
            .from("messaging_escalation_rules")
            .select("*")
            .eq("is_active", true);

        if (rulesErr || !rules || rules.length === 0) {
            return jsonResponse({ message: "No active escalation rules", escalated: 0 });
        }

        let totalEscalated = 0;
        const results: Array<{ rule_id: string; rule_name: string; escalated: number }> = [];

        for (const rule of rules) {
            let escalatedCount = 0;

            if (rule.trigger_type === "unacknowledged" || rule.trigger_type === "unread_mandatory") {
                // Find unacknowledged mandatory reads older than delay_minutes
                const cutoff = new Date(Date.now() - rule.delay_minutes * 60 * 1000).toISOString();

                const { data: pendingAcks } = await supabase
                    .from("mandatory_read_acknowledgments")
                    .select("id, message_id, user_id, messages!inner(conversation_id, body, created_at)")
                    .is("acknowledged_at", null)
                    .lt("messages.created_at", cutoff);

                if (pendingAcks && pendingAcks.length > 0) {
                    // Process escalation levels
                    const levels = (rule.escalation_levels as Array<{
                        delay_minutes: number;
                        action: string;
                        target_role?: string;
                    }>) ?? [];

                    for (const ack of pendingAcks) {
                        const msgData = ack.messages as unknown as { conversation_id: string; body: string; created_at: string };
                        const messageAge = (Date.now() - new Date(msgData.created_at).getTime()) / 60000;

                        // Find the appropriate escalation level based on age
                        const applicableLevel = levels
                            .filter((l) => messageAge >= l.delay_minutes)
                            .sort((a, b) => b.delay_minutes - a.delay_minutes)[0];

                        if (applicableLevel) {
                            if (applicableLevel.action === "reminder") {
                                // Send a DM reminder to the user
                                await sendReminderDm(supabase, ack.user_id, msgData.body, msgData.conversation_id);
                                escalatedCount++;
                            } else if (applicableLevel.action === "notify_manager") {
                                // Find user's manager and notify them
                                const { data: profile } = await supabase
                                    .from("profiles")
                                    .select("name, manager_id")
                                    .eq("id", ack.user_id)
                                    .single();

                                if (profile?.manager_id) {
                                    await sendReminderDm(
                                        supabase,
                                        profile.manager_id,
                                        `⚠️ ${profile.name ?? "A team member"} has not acknowledged a mandatory message:\n\n"${msgData.body.slice(0, 200)}"`,
                                        msgData.conversation_id
                                    );
                                    escalatedCount++;
                                }
                            }
                        }
                    }
                }
            }

            if (rule.trigger_type === "unread_critical") {
                // Find unread messages in channels marked as critical/safety
                const cutoff = new Date(Date.now() - rule.delay_minutes * 60 * 1000).toISOString();

                const { data: unreadCritical } = await supabase
                    .from("messages")
                    .select("id, conversation_id, body, sender_id, created_at, conversations!inner(category)")
                    .in("conversations.category", ["safety"])
                    .eq("message_type", "user")
                    .lt("created_at", cutoff)
                    .is("deleted_at", null)
                    .limit(50);

                if (unreadCritical && unreadCritical.length > 0) {
                    // For each unread critical message, check if members have read it
                    for (const msg of unreadCritical) {
                        const { data: members } = await supabase
                            .from("conversation_members")
                            .select("user_id")
                            .eq("conversation_id", msg.conversation_id)
                            .neq("user_id", msg.sender_id);

                        const { data: readReceipts } = await supabase
                            .from("message_read_receipts")
                            .select("user_id")
                            .eq("message_id", msg.id);

                        const readUserIds = new Set((readReceipts ?? []).map((r) => r.user_id));
                        const unreadMembers = (members ?? []).filter((m) => !readUserIds.has(m.user_id));

                        for (const member of unreadMembers) {
                            await sendReminderDm(
                                supabase,
                                member.user_id,
                                `🔴 You have an unread safety message that requires attention.`,
                                msg.conversation_id
                            );
                            escalatedCount++;
                        }
                    }
                }
            }

            results.push({ rule_id: rule.id, rule_name: rule.name, escalated: escalatedCount });
            totalEscalated += escalatedCount;
        }

        console.log(`Escalation engine: ${totalEscalated} escalations across ${rules.length} rules`);
        return jsonResponse({ escalated: totalEscalated, rules: results });
    } catch (err) {
        console.error("escalation-engine error:", err);
        return errorResponse("Internal server error", 500);
    }
});

async function sendReminderDm(
    supabase: ReturnType<typeof createServiceClient>,
    userId: string,
    body: string,
    sourceConversationId: string
) {
    // Find or create a system DM with this user
    const systemUserId = "00000000-0000-0000-0000-000000000000"; // System user placeholder

    const { data: existingDm } = await supabase
        .from("conversations")
        .select("id")
        .eq("type", "dm")
        .eq("slug", `system-dm-${userId}`)
        .limit(1)
        .single();

    let dmId: string;
    if (existingDm) {
        dmId = existingDm.id;
    } else {
        const { data: newDm } = await supabase
            .from("conversations")
            .insert({
                type: "dm",
                slug: `system-dm-${userId}`,
                name: "System Notifications",
            })
            .select("id")
            .single();

        if (!newDm) return;
        dmId = newDm.id;

        // Add user as member
        await supabase.from("conversation_members").insert([
            { conversation_id: dmId, user_id: userId, role: "member" },
        ]);
    }

    // Send the reminder message
    await supabase.from("messages").insert({
        conversation_id: dmId,
        sender_id: systemUserId,
        body,
        message_type: "system",
        metadata: { source_conversation_id: sourceConversationId },
    });
}
