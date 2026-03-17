import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: collaborator-deadline-monitor
 *
 * Cron-invoked (daily). Scans collaborator_requirements for approaching
 * or overdue deadlines and triggers reminder emails via send-comm-template.
 *
 * Schedule: 0 8 * * * (daily at 8 AM UTC)
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REMINDER_DAYS_BEFORE = 3;

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers":
                    "authorization, content-type, x-client-info, apikey",
            },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS_BEFORE);
    const reminderDateStr = reminderDate.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    let reminders = 0;
    let expired = 0;
    let errors = 0;

    try {
        // 1. Find requirements with deadlines approaching (within REMINDER_DAYS_BEFORE)
        // that are still in "requested" status (not yet submitted)
        const { data: approaching } = await supabase
            .from("collaborator_requirements")
            .select(
                `
                id, requirement_type, label, deadline, project_collaborator_id,
                project_collaborators!inner(
                    id, project_id,
                    vendors:vendor_id(name, email, contact_name)
                )
            `
            )
            .in("status", ["requested"])
            .lte("deadline", reminderDateStr)
            .gt("deadline", todayStr)
            .is("deleted_at", null);

        if (approaching && approaching.length > 0) {
            for (const req of approaching) {
                try {
                    const collab = req.project_collaborators as Record<string, unknown>;
                    const vendor = collab?.vendors as Record<string, unknown> | null;
                    if (!vendor?.email) continue;

                    // Invoke send-comm-template
                    await supabase.functions.invoke("send-comm-template", {
                        body: {
                            template_key: "deadline_reminder",
                            project_id: collab.project_id,
                            collaborator_id: collab.id,
                            recipient_email: String(vendor.email),
                            recipient_name: String(vendor.contact_name ?? vendor.name ?? ""),
                            variables: {
                                requirement_label: req.label,
                                deadline: req.deadline,
                                days_remaining: String(
                                    Math.ceil(
                                        (new Date(req.deadline).getTime() - now.getTime()) /
                                            (1000 * 60 * 60 * 24)
                                    )
                                ),
                            },
                        },
                    });
                    reminders++;
                } catch (err) {
                    console.error(
                        `[deadline-monitor] Error sending reminder for req ${req.id}:`,
                        err
                    );
                    errors++;
                }
            }
        }

        // 2. Find requirements that are overdue — deadline < today, still requested
        const { data: overdue } = await supabase
            .from("collaborator_requirements")
            .select("id, status, deadline")
            .in("status", ["requested"])
            .lt("deadline", todayStr)
            .is("deleted_at", null);

        if (overdue && overdue.length > 0) {
            // Update status to "expired" for overdue requirements
            const overdueIds = overdue.map((r: Record<string, unknown>) => r.id as string);
            const { error: updateError } = await supabase
                .from("collaborator_requirements")
                .update({ status: "expired" })
                .in("id", overdueIds);

            if (updateError) {
                console.error(
                    "[deadline-monitor] Error updating expired requirements:",
                    updateError
                );
                errors++;
            } else {
                expired = overdueIds.length;
            }
        }

        console.log(
            `[deadline-monitor] Processed: ${reminders} reminders sent, ${expired} expired, ${errors} errors`
        );

        return new Response(
            JSON.stringify({
                success: true,
                reminders_sent: reminders,
                requirements_expired: expired,
                errors,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("[deadline-monitor] Unhandled error:", err);
        return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
    }
});
