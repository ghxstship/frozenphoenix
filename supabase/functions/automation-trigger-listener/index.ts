/**
 * Edge Function: automation-trigger-listener
 *
 * Listens for pg_notify events on the 'automation_trigger' channel and
 * dispatches matching automations by calling the automation execution engine.
 *
 * Can also be invoked directly via POST with a trigger payload for manual
 * or webhook-driven automation dispatch.
 *
 * Payload shape (from pg_notify or POST body):
 * {
 *   trigger_type: "created" | "updated" | "status_changed" | "deleted",
 *   entity_type: string,
 *   record_id: string,
 *   organization_id: string,
 *   old_status?: string,
 *   new_status?: string
 * }
 */

import {
    createServiceClient,
    errorResponse,
    jsonResponse,
    requireServiceRoleAuth,
} from "../_shared/webhook-utils.ts";
import { handleHealthCheck } from "../_shared/health.ts";

interface TriggerPayload {
    trigger_type: string;
    entity_type: string;
    record_id: string;
    organization_id: string;
    old_status?: string;
    new_status?: string;
}

Deno.serve(async (req: Request) => {
    // Health check
    const healthResponse = await handleHealthCheck(req, "automation-trigger-listener");
    if (healthResponse) return healthResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    // Auth guard — only pg_notify / cron / internal callers with service role key
    const authErr = requireServiceRoleAuth(req);
    if (authErr) return authErr;

    const supabase = createServiceClient();

    let payload: TriggerPayload;
    try {
        payload = await req.json();
    } catch {
        return errorResponse("Invalid JSON payload", 400);
    }

    const { trigger_type, entity_type, record_id, organization_id } = payload;

    if (!trigger_type || !entity_type || !record_id || !organization_id) {
        return errorResponse(
            "Missing required fields: trigger_type, entity_type, record_id, organization_id",
            400
        );
    }

    // -----------------------------------------------------------------------
    // 1. Find matching active automations for this trigger + entity + org
    // -----------------------------------------------------------------------
    const { data: automations, error: fetchErr } = await supabase
        .from("automations")
        .select("*, automation_rules(*)")
        .eq("is_active", true)
        .eq("entity_type", entity_type)
        .eq("organization_id", organization_id);

    if (fetchErr) {
        console.error("Failed to fetch automations:", fetchErr.message);
        return errorResponse("Failed to fetch automations", 500);
    }

    if (!automations || automations.length === 0) {
        return jsonResponse({ executed: 0, message: "No matching automations" });
    }

    // Filter automations that have rules matching this trigger_type
    const matchingAutomations = automations.filter((a: Record<string, unknown>) => {
        const rules = (a.automation_rules as Array<Record<string, unknown>>) ?? [];
        return rules.some((r) => r.trigger_type === trigger_type && r.is_active !== false);
    });

    if (matchingAutomations.length === 0) {
        return jsonResponse({ executed: 0, message: "No rules match trigger type" });
    }

    // -----------------------------------------------------------------------
    // 2. Fetch the trigger record
    // -----------------------------------------------------------------------
    const { data: record, error: recordErr } = await supabase
        .from(entity_type)
        .select("*")
        .eq("id", record_id)
        .single();

    if (recordErr || !record) {
        console.error(`Failed to fetch ${entity_type}/${record_id}:`, recordErr?.message);
        return errorResponse(`Record not found: ${entity_type}/${record_id}`, 404);
    }

    // -----------------------------------------------------------------------
    // 3. Execute each matching automation
    // -----------------------------------------------------------------------
    const results: Array<{
        automation_id: string;
        automation_name: string;
        status: string;
        actions_executed?: Array<{ action: string; status: string; detail?: string }>;
        error?: string;
        duration_ms?: number;
    }> = [];

    for (const automation of matchingAutomations) {
        const execStart = Date.now();
        const automationId = automation.id as string;
        const automationName = automation.name as string;

        try {
            const rules = (automation.automation_rules as Array<Record<string, unknown>>) ?? [];
            const matchingRules = rules.filter(
                (r) => r.trigger_type === trigger_type && r.is_active !== false
            );

            for (const rule of matchingRules) {
                // Evaluate conditions
                const conditions =
                    (rule.conditions as Array<{
                        field: string;
                        operator: string;
                        value: unknown;
                    }>) ?? [];

                const conditionsMet = evaluateConditions(
                    conditions,
                    record as Record<string, unknown>
                );

                // Create execution record
                const { data: execRecord } = await supabase
                    .from("automation_executions")
                    .insert({
                        automation_id: automationId,
                        trigger_record_type: entity_type,
                        trigger_record_id: record_id,
                        status: conditionsMet ? "running" : "skipped",
                        organization_id,
                    })
                    .select("id")
                    .single();

                const execId = (execRecord?.id as string) ?? null;

                if (!conditionsMet) {
                    if (execId) {
                        await supabase
                            .from("automation_executions")
                            .update({
                                status: "skipped",
                                error: "Conditions not met",
                                duration_ms: Date.now() - execStart,
                                completed_at: new Date().toISOString(),
                            })
                            .eq("id", execId);
                    }
                    results.push({
                        automation_id: automationId,
                        automation_name: automationName,
                        status: "skipped",
                    });
                    continue;
                }

                // Execute actions
                const actionType = rule.action_type as string;
                const actionConfig = (rule.action_config as Record<string, unknown>) ?? {};
                const actionResults = await executeAction(
                    supabase,
                    actionType,
                    actionConfig,
                    record as Record<string, unknown>,
                    organization_id
                );

                const duration = Date.now() - execStart;
                const hasFailure = actionResults.some((r) => r.status === "failed");

                // Update execution record
                if (execId) {
                    await supabase
                        .from("automation_executions")
                        .update({
                            status: hasFailure ? "failed" : "success",
                            actions_executed: actionResults,
                            duration_ms: duration,
                            completed_at: new Date().toISOString(),
                            error: hasFailure
                                ? actionResults.find((r) => r.status === "failed")?.detail
                                : null,
                        })
                        .eq("id", execId);
                }

                // Update automation stats
                await supabase
                    .from("automations")
                    .update({
                        last_triggered_at: new Date().toISOString(),
                        trigger_count: ((automation.trigger_count as number) ?? 0) + 1,
                        error_count: hasFailure
                            ? ((automation.error_count as number) ?? 0) + 1
                            : ((automation.error_count as number) ?? 0),
                    })
                    .eq("id", automationId);

                // If failed, add to dead-letter queue
                if (hasFailure) {
                    await supabase.from("automation_dead_letters").insert({
                        automation_id: automationId,
                        execution_id: execId,
                        trigger_type,
                        entity_type,
                        entity_id: record_id,
                        payload: { record, rule_id: rule.id, action_results: actionResults },
                        error: actionResults.find((r) => r.status === "failed")?.detail,
                        next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                        organization_id,
                    });
                }

                results.push({
                    automation_id: automationId,
                    automation_name: automationName,
                    status: hasFailure ? "failed" : "success",
                    actions_executed: actionResults,
                    duration_ms: duration,
                });

                // Fire outbound webhooks for this event
                await fireOutboundWebhooks(
                    supabase,
                    organization_id,
                    trigger_type,
                    entity_type,
                    record as Record<string, unknown>
                );
            }
        } catch (err) {
            const errMsg = (err as Error).message;
            console.error(`Automation ${automationId} failed:`, errMsg);
            results.push({
                automation_id: automationId,
                automation_name: automationName,
                status: "failed",
                error: errMsg,
            });
        }
    }

    return jsonResponse({
        executed: results.length,
        results,
    });
});

// ---------------------------------------------------------------------------
// Condition Evaluation
// ---------------------------------------------------------------------------

function evaluateConditions(
    conditions: Array<{ field: string; operator: string; value: unknown }>,
    record: Record<string, unknown>
): boolean {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every((cond) => {
        const fieldValue = record[cond.field];
        switch (cond.operator) {
            case "equals":
                return fieldValue === cond.value;
            case "not_equals":
                return fieldValue !== cond.value;
            case "contains":
                return typeof fieldValue === "string" && fieldValue.includes(String(cond.value));
            case "greater_than":
                return Number(fieldValue) > Number(cond.value);
            case "less_than":
                return Number(fieldValue) < Number(cond.value);
            case "is_empty":
                return !fieldValue;
            case "is_not_empty":
                return !!fieldValue;
            case "in":
                return Array.isArray(cond.value) && (cond.value as unknown[]).includes(fieldValue);
            case "not_in":
                return Array.isArray(cond.value) && !(cond.value as unknown[]).includes(fieldValue);
            default:
                return true;
        }
    });
}

// ---------------------------------------------------------------------------
// Action Execution
// ---------------------------------------------------------------------------

async function executeAction(
    supabase: ReturnType<typeof createServiceClient>,
    actionType: string,
    config: Record<string, unknown>,
    record: Record<string, unknown>,
    orgId: string
): Promise<Array<{ action: string; status: string; detail?: string }>> {
    const results: Array<{ action: string; status: string; detail?: string }> = [];

    try {
        switch (actionType) {
            case "send_notification": {
                const userId = (config.user_id as string) || (record.assigned_to as string);
                if (userId) {
                    await supabase.from("notifications").insert({
                        user_id: userId,
                        type: "automation",
                        title: (config.title as string) || "Automation triggered",
                        message:
                            (config.body as string) ||
                            `Automation executed for ${record.name || record.title || record.id}`,
                        action_url: (config.action_url as string) || null,
                        organization_id: orgId,
                    });
                    results.push({ action: "send_notification", status: "success" });
                } else {
                    results.push({
                        action: "send_notification",
                        status: "skipped",
                        detail: "No target user",
                    });
                }
                break;
            }

            case "send_email": {
                const emailTo = (config.to as string) || (record.email as string);
                if (!emailTo) {
                    results.push({
                        action: "send_email",
                        status: "skipped",
                        detail: "No email address",
                    });
                    break;
                }
                // Call the notification dispatch API which handles email delivery
                const appUrl = Deno.env.get("APP_URL") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "";
                if (appUrl) {
                    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
                    const response = await fetch(`${appUrl}/api/notifications/dispatch`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${serviceKey}`,
                        },
                        body: JSON.stringify({
                            user_id: config.user_id || record.assigned_to || record.created_by,
                            title: (config.subject as string) || "Automation Notification",
                            body:
                                (config.body as string) ||
                                `An automation was triggered for ${record.name || record.title || "a record"}.`,
                            type: "automation",
                        }),
                    });
                    results.push({
                        action: "send_email",
                        status: response.ok ? "success" : "failed",
                        detail: response.ok ? "Email dispatched" : `HTTP ${response.status}`,
                    });
                } else {
                    results.push({
                        action: "send_email",
                        status: "failed",
                        detail: "APP_URL not configured",
                    });
                }
                break;
            }

            case "update_field": {
                const table = (config.table as string) || (record.entity_type as string);
                const recordId = record.id as string;
                const field = config.field as string;
                const value = config.value;
                if (table && recordId && field) {
                    await supabase
                        .from(table)
                        .update({ [field]: value })
                        .eq("id", recordId);
                    results.push({
                        action: "update_field",
                        status: "success",
                        detail: `${field} = ${value}`,
                    });
                } else {
                    results.push({
                        action: "update_field",
                        status: "failed",
                        detail: "Missing table, record, or field",
                    });
                }
                break;
            }

            case "create_task": {
                await supabase.from("tasks").insert({
                    title:
                        (config.title as string) ||
                        `Follow-up: ${record.name || record.title || ""}`,
                    description: (config.description as string) || "Auto-created by automation",
                    project_id: record.project_id || null,
                    assigned_to: config.assigned_to || record.assigned_to || null,
                    status: "todo",
                    priority: config.priority || "medium",
                    organization_id: orgId,
                });
                results.push({ action: "create_task", status: "success" });
                break;
            }

            case "assign_user": {
                const assignTable = (config.table as string) || (record.entity_type as string);
                const assignId = record.id as string;
                const assignTo = config.user_id as string;
                if (assignTable && assignId && assignTo) {
                    await supabase
                        .from(assignTable)
                        .update({ assigned_to: assignTo })
                        .eq("id", assignId);
                    results.push({ action: "assign_user", status: "success" });
                } else {
                    results.push({
                        action: "assign_user",
                        status: "failed",
                        detail: "Missing parameters",
                    });
                }
                break;
            }

            case "move_stage": {
                const stageTable = (config.table as string) || (record.entity_type as string);
                const stageId = record.id as string;
                const newStage = config.stage as string;
                if (stageTable && stageId && newStage) {
                    await supabase.from(stageTable).update({ status: newStage }).eq("id", stageId);
                    results.push({ action: "move_stage", status: "success" });
                } else {
                    results.push({
                        action: "move_stage",
                        status: "failed",
                        detail: "Missing parameters",
                    });
                }
                break;
            }

            case "webhook": {
                const webhookUrl = config.url as string;
                if (!webhookUrl) {
                    results.push({
                        action: "webhook",
                        status: "failed",
                        detail: "No webhook URL configured",
                    });
                    break;
                }
                try {
                    const webhookPayload = {
                        event: actionType,
                        entity_type: record.entity_type || "",
                        entity_id: record.id,
                        data: record,
                        triggered_at: new Date().toISOString(),
                    };
                    const headers: Record<string, string> = {
                        "Content-Type": "application/json",
                        ...((config.headers as Record<string, string>) ?? {}),
                    };
                    // Add HMAC signature if secret is configured
                    if (config.secret) {
                        const encoder = new TextEncoder();
                        const key = await crypto.subtle.importKey(
                            "raw",
                            encoder.encode(config.secret as string),
                            { name: "HMAC", hash: "SHA-256" },
                            false,
                            ["sign"]
                        );
                        const body = JSON.stringify(webhookPayload);
                        const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
                        const hexSig = Array.from(new Uint8Array(sig))
                            .map((b) => b.toString(16).padStart(2, "0"))
                            .join("");
                        headers["X-Webhook-Signature"] = `sha256=${hexSig}`;
                    }

                    const response = await fetch(webhookUrl, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(webhookPayload),
                    });
                    results.push({
                        action: "webhook",
                        status: response.ok ? "success" : "failed",
                        detail: `HTTP ${response.status}`,
                    });
                } catch (err) {
                    results.push({
                        action: "webhook",
                        status: "failed",
                        detail: (err as Error).message,
                    });
                }
                break;
            }

            case "slack_message": {
                const slackWebhookUrl = config.webhook_url as string;
                if (!slackWebhookUrl) {
                    // Try to find a Slack connection for the org
                    const { data: slackConn } = await supabase
                        .from("provider_connections")
                        .select("webhook_url")
                        .eq("provider_type", "slack")
                        .eq("organization_id", orgId)
                        .eq("is_active", true)
                        .limit(1)
                        .single();

                    if (!slackConn?.webhook_url) {
                        results.push({
                            action: "slack_message",
                            status: "failed",
                            detail: "No Slack webhook URL configured",
                        });
                        break;
                    }
                }
                const targetUrl = slackWebhookUrl || "";
                try {
                    const slackPayload = {
                        text:
                            (config.text as string) ||
                            `Automation triggered: ${record.name || record.title || record.id}`,
                        channel: (config.channel as string) || undefined,
                        username: (config.username as string) || "Playbook Automations",
                        icon_emoji: (config.icon_emoji as string) || ":zap:",
                    };
                    const response = await fetch(targetUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(slackPayload),
                    });
                    results.push({
                        action: "slack_message",
                        status: response.ok ? "success" : "failed",
                        detail: response.ok ? "Slack message sent" : `HTTP ${response.status}`,
                    });
                } catch (err) {
                    results.push({
                        action: "slack_message",
                        status: "failed",
                        detail: (err as Error).message,
                    });
                }
                break;
            }

            case "add_comment": {
                await supabase.from("record_comments").insert({
                    entity_type: (config.entity_type as string) || record.entity_type || "",
                    entity_id: record.id,
                    body: (config.body as string) || "Automated comment",
                    is_system: true,
                    organization_id: orgId,
                });
                results.push({ action: "add_comment", status: "success" });
                break;
            }

            default:
                results.push({
                    action: actionType,
                    status: "skipped",
                    detail: "Unknown action type",
                });
        }
    } catch (err) {
        results.push({ action: actionType, status: "failed", detail: (err as Error).message });
    }

    return results;
}

// ---------------------------------------------------------------------------
// Outbound Webhook Delivery (G3)
// ---------------------------------------------------------------------------

async function fireOutboundWebhooks(
    supabase: ReturnType<typeof createServiceClient>,
    orgId: string,
    triggerType: string,
    entityType: string,
    record: Record<string, unknown>
): Promise<void> {
    const eventType = `${entityType}.${triggerType}`;

    // Find active subscriptions that match this event type
    const { data: subscriptions } = await supabase
        .from("webhook_subscriptions")
        .select("*")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .contains("event_types", [eventType]);

    if (!subscriptions || subscriptions.length === 0) return;

    for (const sub of subscriptions) {
        const payload = {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: record,
        };

        // Sign the payload
        const body = JSON.stringify(payload);
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

        // Create delivery record
        const { data: delivery } = await supabase
            .from("webhook_deliveries")
            .insert({
                subscription_id: sub.id,
                event_type: eventType,
                payload,
                status: "pending",
            })
            .select("id")
            .single();

        // Attempt delivery
        try {
            const customHeaders = (sub.headers as Record<string, string>) ?? {};
            const response = await fetch(sub.target_url as string, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": `sha256=${hexSig}`,
                    "X-Webhook-Event": eventType,
                    ...customHeaders,
                },
                body,
            });

            if (delivery?.id) {
                await supabase
                    .from("webhook_deliveries")
                    .update({
                        status: response.ok ? "delivered" : "failed",
                        response_status: response.status,
                        attempt_count: 1,
                        delivered_at: response.ok ? new Date().toISOString() : null,
                        next_retry_at: response.ok
                            ? null
                            : new Date(Date.now() + 5 * 1000).toISOString(),
                    })
                    .eq("id", delivery.id);
            }

            if (!response.ok) {
                // Increment subscription failure count
                await supabase
                    .from("webhook_subscriptions")
                    .update({
                        failure_count: ((sub.failure_count as number) ?? 0) + 1,
                        is_active:
                            ((sub.failure_count as number) ?? 0) + 1 <
                            ((sub.max_failures as number) ?? 10),
                    })
                    .eq("id", sub.id);
            } else {
                // Reset failure count on success
                if (((sub.failure_count as number) ?? 0) > 0) {
                    await supabase
                        .from("webhook_subscriptions")
                        .update({ failure_count: 0 })
                        .eq("id", sub.id);
                }
            }
        } catch (err) {
            console.error(`Webhook delivery failed for ${sub.id}:`, (err as Error).message);
            if (delivery?.id) {
                await supabase
                    .from("webhook_deliveries")
                    .update({
                        status: "failed",
                        response_body: (err as Error).message,
                        attempt_count: 1,
                        next_retry_at: new Date(Date.now() + 5 * 1000).toISOString(),
                    })
                    .eq("id", delivery.id);
            }
        }
    }
}
