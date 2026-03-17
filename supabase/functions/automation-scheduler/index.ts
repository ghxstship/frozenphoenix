/**
 * Edge Function: automation-scheduler
 *
 * Runs on a cron schedule (e.g., every minute) to:
 * 1. Find automations with scheduled triggers whose next_scheduled_at <= now
 * 2. Find automations with due_date_approaching / overdue triggers
 * 3. Retry failed automation dead-letter queue entries
 * 4. Retry failed outbound webhook deliveries
 *
 * Invoke via: Supabase cron (pg_cron) or external scheduler
 */

import {
    createServiceClient,
    errorResponse,
    jsonResponse,
    requireServiceRoleAuth,
} from "../_shared/webhook-utils.ts";
import { handleHealthCheck } from "../_shared/health.ts";

Deno.serve(async (req: Request) => {
    // Health check
    const healthResponse = await handleHealthCheck(req, "automation-scheduler");
    if (healthResponse) return healthResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    // Auth guard — only cron / internal callers with service role key
    const authErr = requireServiceRoleAuth(req);
    if (authErr) return authErr;

    const supabase = createServiceClient();
    const now = new Date();
    const results = {
        scheduled: 0,
        due_date_approaching: 0,
        overdue: 0,
        dead_letter_retries: 0,
        webhook_retries: 0,
        errors: [] as string[],
    };

    // -----------------------------------------------------------------------
    // 1. Scheduled automations (cron-based)
    // -----------------------------------------------------------------------
    try {
        const { data: scheduledAutomations } = await supabase
            .from("automations")
            .select("id, name, entity_type, organization_id, schedule_cron, schedule_timezone")
            .eq("is_active", true)
            .not("schedule_cron", "is", null)
            .lte("next_scheduled_at", now.toISOString());

        if (scheduledAutomations && scheduledAutomations.length > 0) {
            for (const automation of scheduledAutomations) {
                try {
                    // Find all records of this entity type in the org (limit to recent)
                    const { data: records } = await supabase
                        .from(automation.entity_type as string)
                        .select("id")
                        .eq("organization_id", automation.organization_id)
                        .order("updated_at", { ascending: false })
                        .limit(100);

                    if (records && records.length > 0) {
                        // Dispatch the automation for each record
                        const triggerUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/automation-trigger-listener`;
                        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

                        for (const record of records) {
                            await fetch(triggerUrl, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${serviceKey}`,
                                },
                                body: JSON.stringify({
                                    trigger_type: "scheduled",
                                    entity_type: automation.entity_type,
                                    record_id: record.id,
                                    organization_id: automation.organization_id,
                                }),
                            });
                        }
                        results.scheduled += records.length;
                    }

                    // Compute next scheduled time
                    const nextTime = computeNextCronTime(
                        automation.schedule_cron as string,
                        (automation.schedule_timezone as string) || "UTC"
                    );
                    await supabase
                        .from("automations")
                        .update({ next_scheduled_at: nextTime })
                        .eq("id", automation.id);
                } catch (err) {
                    results.errors.push(`Scheduled ${automation.id}: ${(err as Error).message}`);
                }
            }
        }
    } catch (err) {
        results.errors.push(`Scheduled scan: ${(err as Error).message}`);
    }

    // -----------------------------------------------------------------------
    // 2. Due date approaching triggers (tasks due within 24h)
    // -----------------------------------------------------------------------
    try {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Find automations with due_date_approaching trigger
        const { data: dueDateAutomations } = await supabase
            .from("automations")
            .select(
                "id, entity_type, organization_id, automation_rules!inner(id, trigger_type, action_type, action_config, conditions)"
            )
            .eq("is_active", true)
            .eq("automation_rules.trigger_type", "due_date_approaching")
            .eq("automation_rules.is_active", true);

        if (dueDateAutomations && dueDateAutomations.length > 0) {
            for (const automation of dueDateAutomations) {
                try {
                    const { data: dueSoonRecords } = await supabase
                        .from(automation.entity_type as string)
                        .select("id")
                        .eq("organization_id", automation.organization_id)
                        .gte("due_date", now.toISOString())
                        .lte("due_date", tomorrow.toISOString())
                        .not("status", "in", '("completed","cancelled","done")');

                    if (dueSoonRecords && dueSoonRecords.length > 0) {
                        const triggerUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/automation-trigger-listener`;
                        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

                        for (const record of dueSoonRecords) {
                            await fetch(triggerUrl, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${serviceKey}`,
                                },
                                body: JSON.stringify({
                                    trigger_type: "due_date_approaching",
                                    entity_type: automation.entity_type,
                                    record_id: record.id,
                                    organization_id: automation.organization_id,
                                }),
                            });
                            results.due_date_approaching++;
                        }
                    }
                } catch (err) {
                    results.errors.push(`DueDate ${automation.id}: ${(err as Error).message}`);
                }
            }
        }
    } catch (err) {
        results.errors.push(`Due date scan: ${(err as Error).message}`);
    }

    // -----------------------------------------------------------------------
    // 3. Overdue triggers (tasks past due_date with non-terminal status)
    // -----------------------------------------------------------------------
    try {
        const { data: overdueAutomations } = await supabase
            .from("automations")
            .select("id, entity_type, organization_id, automation_rules!inner(id, trigger_type)")
            .eq("is_active", true)
            .eq("automation_rules.trigger_type", "overdue")
            .eq("automation_rules.is_active", true);

        if (overdueAutomations && overdueAutomations.length > 0) {
            for (const automation of overdueAutomations) {
                try {
                    const { data: overdueRecords } = await supabase
                        .from(automation.entity_type as string)
                        .select("id")
                        .eq("organization_id", automation.organization_id)
                        .lt("due_date", now.toISOString())
                        .not("status", "in", '("completed","cancelled","done")');

                    if (overdueRecords && overdueRecords.length > 0) {
                        const triggerUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/automation-trigger-listener`;
                        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

                        for (const record of overdueRecords) {
                            await fetch(triggerUrl, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${serviceKey}`,
                                },
                                body: JSON.stringify({
                                    trigger_type: "overdue",
                                    entity_type: automation.entity_type,
                                    record_id: record.id,
                                    organization_id: automation.organization_id,
                                }),
                            });
                            results.overdue++;
                        }
                    }
                } catch (err) {
                    results.errors.push(`Overdue ${automation.id}: ${(err as Error).message}`);
                }
            }
        }
    } catch (err) {
        results.errors.push(`Overdue scan: ${(err as Error).message}`);
    }

    // -----------------------------------------------------------------------
    // 4. Dead-letter queue retries (G22)
    // -----------------------------------------------------------------------
    try {
        const { data: deadLetters } = await supabase
            .from("automation_dead_letters")
            .select("*")
            .is("resolved_at", null)
            .lte("next_retry_at", now.toISOString())
            .lt("retry_count", 3)
            .limit(50);

        if (deadLetters && deadLetters.length > 0) {
            const triggerUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/automation-trigger-listener`;
            const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

            for (const dl of deadLetters) {
                try {
                    const response = await fetch(triggerUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${serviceKey}`,
                        },
                        body: JSON.stringify({
                            trigger_type: dl.trigger_type,
                            entity_type: dl.entity_type,
                            record_id: dl.entity_id,
                            organization_id: dl.organization_id,
                        }),
                    });

                    if (response.ok) {
                        await supabase
                            .from("automation_dead_letters")
                            .update({ resolved_at: now.toISOString() })
                            .eq("id", dl.id);
                    } else {
                        const backoffMinutes = Math.pow(2, dl.retry_count + 1) * 5;
                        await supabase
                            .from("automation_dead_letters")
                            .update({
                                retry_count: dl.retry_count + 1,
                                next_retry_at: new Date(
                                    now.getTime() + backoffMinutes * 60 * 1000
                                ).toISOString(),
                            })
                            .eq("id", dl.id);
                    }
                    results.dead_letter_retries++;
                } catch (err) {
                    results.errors.push(`DLQ ${dl.id}: ${(err as Error).message}`);
                }
            }
        }
    } catch (err) {
        results.errors.push(`DLQ scan: ${(err as Error).message}`);
    }

    // -----------------------------------------------------------------------
    // 5. Webhook delivery retries (G3)
    // -----------------------------------------------------------------------
    try {
        const { data: pendingDeliveries } = await supabase
            .from("webhook_deliveries")
            .select("*, webhook_subscriptions!inner(target_url, secret, headers, is_active)")
            .in("status", ["pending", "retrying"])
            .lte("next_retry_at", now.toISOString())
            .lt("attempt_count", 5)
            .eq("webhook_subscriptions.is_active", true)
            .limit(50);

        if (pendingDeliveries && pendingDeliveries.length > 0) {
            for (const delivery of pendingDeliveries) {
                try {
                    const sub = delivery.webhook_subscriptions as Record<string, unknown>;
                    const body = JSON.stringify(delivery.payload);

                    // Sign the payload
                    const encoder = new TextEncoder();
                    const key = await crypto.subtle.importKey(
                        "raw",
                        encoder.encode(sub.secret as string),
                        { name: "HMAC", hash: "SHA-256" },
                        false,
                        ["sign"]
                    );
                    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
                    const hexSig = Array.from(new Uint8Array(sig))
                        .map((b) => b.toString(16).padStart(2, "0"))
                        .join("");

                    const customHeaders = (sub.headers as Record<string, string>) ?? {};
                    const response = await fetch(sub.target_url as string, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Webhook-Signature": `sha256=${hexSig}`,
                            "X-Webhook-Event": delivery.event_type,
                            ...customHeaders,
                        },
                        body,
                    });

                    const newAttemptCount = (delivery.attempt_count as number) + 1;
                    const backoffSeconds = [5, 30, 120, 600, 3600];
                    const nextBackoff =
                        backoffSeconds[Math.min(newAttemptCount, backoffSeconds.length - 1)] ??
                        3600;

                    await supabase
                        .from("webhook_deliveries")
                        .update({
                            status: response.ok
                                ? "delivered"
                                : newAttemptCount >= 5
                                  ? "failed"
                                  : "retrying",
                            response_status: response.status,
                            attempt_count: newAttemptCount,
                            delivered_at: response.ok ? now.toISOString() : null,
                            next_retry_at: response.ok
                                ? null
                                : new Date(now.getTime() + nextBackoff * 1000).toISOString(),
                        })
                        .eq("id", delivery.id);

                    results.webhook_retries++;
                } catch (err) {
                    results.errors.push(`Webhook retry ${delivery.id}: ${(err as Error).message}`);
                }
            }
        }
    } catch (err) {
        results.errors.push(`Webhook retry scan: ${(err as Error).message}`);
    }

    console.log("Automation scheduler results:", JSON.stringify(results));
    return jsonResponse(results);
});

// ---------------------------------------------------------------------------
// Cron Expression Parser (simplified — supports standard 5-field cron)
// ---------------------------------------------------------------------------

function computeNextCronTime(cron: string, _timezone: string): string {
    // Simple next-minute computation for common patterns
    // A production implementation would use a full cron parser
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) {
        return new Date(Date.now() + 60 * 60 * 1000).toISOString(); // fallback: 1 hour
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const now = new Date();

    // Simple case: specific minute + hour (e.g., "30 9 * * *" = daily at 9:30)
    if (minute !== "*" && hour !== "*" && dayOfMonth === "*" && month === "*") {
        const targetMinute = parseInt(minute!, 10);
        const targetHour = parseInt(hour!, 10);

        const next = new Date(now);
        next.setHours(targetHour, targetMinute, 0, 0);

        if (next <= now) {
            // Move to next qualifying day
            if (dayOfWeek === "*") {
                next.setDate(next.getDate() + 1);
            } else {
                // Advance to next matching day of week
                const targetDow = parseInt(dayOfWeek!, 10);
                const currentDow = now.getDay();
                const daysAhead = (targetDow - currentDow + 7) % 7 || 7;
                next.setDate(next.getDate() + daysAhead);
            }
        }
        return next.toISOString();
    }

    // Fallback: next hour
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}
