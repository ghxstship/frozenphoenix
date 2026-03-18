import { NextResponse } from "next/server";
import { getServerSupabase, type ServerClient, serverFromTable } from "@/lib/supabase/server";
import { withPermission } from "@/app/api/middleware/permissions";
import { ApiErrors } from "@/lib/api-utils";
import { automationExecuteSchema, validate } from "@/lib/validation/schemas";

interface AutomationAction {
    type: string;
    config: Record<string, unknown>;
}

interface AutomationRule {
    id: string;
    name: string;
    entity_type: string;
    trigger_type: string;
    conditions: Array<{ field: string; operator: string; value: unknown }>;
    actions: AutomationAction[];
    status: string;
    organization_id: string;
    trigger_count: number;
    error_count: number;
}

async function evaluateConditions(
    conditions: AutomationRule["conditions"],
    record: Record<string, unknown>
): Promise<boolean> {
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
            default:
                return true;
        }
    });
}

// ─── SSRF Guard ─────────────────────────────────────────────
// Blocks requests to internal/private networks and non-HTTPS URLs.
const BLOCKED_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\.\d+\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^0\.0\.0\.0$/,
    /^169\.254\.\d+\.\d+$/,
    /^\[::1\]$/,
    /^metadata\.google\.internal$/i,
];

function isAllowedOutboundUrl(raw: string): boolean {
    try {
        const url = new URL(raw);
        if (url.protocol !== "https:") return false;
        const host = url.hostname;
        return !BLOCKED_HOST_PATTERNS.some((p) => p.test(host));
    } catch {
        return false;
    }
}

async function executeActions(
    supabase: ServerClient,
    actions: AutomationAction[],
    triggerRecord: Record<string, unknown>,
    orgId: string
): Promise<Array<{ action: string; status: string; detail?: string }>> {
    const results: Array<{ action: string; status: string; detail?: string }> = [];

    for (const action of actions) {
        try {
            switch (action.type) {
                case "send_notification": {
                    const userId =
                        (action.config.user_id as string) || (triggerRecord.assigned_to as string);
                    if (userId) {
                        await serverFromTable(supabase, "notifications").insert({
                            user_id: userId,
                            type: "automation",
                            title: (action.config.title as string) || "Automation triggered",
                            body:
                                (action.config.body as string) || `Automation executed for record`,
                            entity_type: triggerRecord.entity_type || "",
                            entity_id: triggerRecord.id || "",
                            organization_id: orgId,
                        });
                    }
                    results.push({ action: "send_notification", status: "success" });
                    break;
                }
                case "send_email": {
                    const emailUserId =
                        (action.config.user_id as string) ||
                        (triggerRecord.assigned_to as string) ||
                        (triggerRecord.created_by as string);
                    if (emailUserId) {
                        try {
                            // Insert notification directly via Supabase client (no HTTP round-trip)
                            const { error: notifErr } = await serverFromTable(
                                supabase,
                                "notifications"
                            ).insert({
                                user_id: emailUserId,
                                type: "automation",
                                title:
                                    (action.config.subject as string) || "Automation Notification",
                                message:
                                    (action.config.body as string) ||
                                    `An automation was triggered for ${triggerRecord.name || triggerRecord.title || "a record"}.`,
                            });
                            results.push({
                                action: "send_email",
                                status: notifErr ? "failed" : "success",
                                detail: notifErr
                                    ? "Notification insert failed"
                                    : "Email dispatched",
                            });
                        } catch {
                            results.push({
                                action: "send_email",
                                status: "failed",
                                detail: "Notification dispatch error",
                            });
                        }
                    } else {
                        results.push({
                            action: "send_email",
                            status: "skipped",
                            detail: "No target user",
                        });
                    }
                    break;
                }
                case "update_field": {
                    const table = action.config.table as string;
                    const recordId = triggerRecord.id as string;
                    const field = action.config.field as string;
                    const value = action.config.value;
                    if (table && recordId && field) {
                        await serverFromTable(supabase, table)
                            .update({ [field]: value })
                            .eq("id", recordId);
                    }
                    results.push({
                        action: "update_field",
                        status: "success",
                        detail: `${field} = ${value}`,
                    });
                    break;
                }
                case "create_task": {
                    await serverFromTable(supabase, "tasks").insert({
                        title:
                            (action.config.title as string) ||
                            `Follow-up: ${triggerRecord.name || triggerRecord.title || ""}`,
                        description:
                            (action.config.description as string) || "Auto-created by automation",
                        project_id: triggerRecord.project_id || null,
                        assigned_to: action.config.assigned_to || triggerRecord.assigned_to || null,
                        status: "todo",
                        priority: action.config.priority || "medium",
                        organization_id: orgId,
                    });
                    results.push({ action: "create_task", status: "success" });
                    break;
                }
                case "assign_user": {
                    const assignTable =
                        (action.config.table as string) || (triggerRecord.entity_type as string);
                    const assignId = triggerRecord.id as string;
                    const assignTo = action.config.user_id as string;
                    if (assignTable && assignId && assignTo) {
                        await serverFromTable(supabase, assignTable)
                            .update({ assigned_to: assignTo })
                            .eq("id", assignId);
                    }
                    results.push({ action: "assign_user", status: "success" });
                    break;
                }
                case "move_stage": {
                    const stageTable =
                        (action.config.table as string) || (triggerRecord.entity_type as string);
                    const stageId = triggerRecord.id as string;
                    const newStage = action.config.stage as string;
                    if (stageTable && stageId && newStage) {
                        await serverFromTable(supabase, stageTable)
                            .update({ status: newStage })
                            .eq("id", stageId);
                    }
                    results.push({ action: "move_stage", status: "success" });
                    break;
                }
                case "webhook": {
                    const webhookUrl = action.config.url as string;
                    if (!webhookUrl) {
                        results.push({
                            action: "webhook",
                            status: "failed",
                            detail: "No webhook URL",
                        });
                        break;
                    }
                    if (!isAllowedOutboundUrl(webhookUrl)) {
                        results.push({
                            action: "webhook",
                            status: "failed",
                            detail: "URL not allowed (must be HTTPS, public host)",
                        });
                        break;
                    }
                    try {
                        const whPayload = {
                            event: "automation",
                            entity_type: triggerRecord.entity_type || "",
                            entity_id: triggerRecord.id,
                            data: triggerRecord,
                            triggered_at: new Date().toISOString(),
                        };
                        const whRes = await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(whPayload),
                            signal: AbortSignal.timeout(10_000),
                        });
                        results.push({
                            action: "webhook",
                            status: whRes.ok ? "success" : "failed",
                            detail: `HTTP ${whRes.status}`,
                        });
                    } catch {
                        results.push({
                            action: "webhook",
                            status: "failed",
                            detail: "Webhook request failed",
                        });
                    }
                    break;
                }
                case "slack_message": {
                    const slackUrl = action.config.webhook_url as string;
                    if (!slackUrl) {
                        results.push({
                            action: "slack_message",
                            status: "failed",
                            detail: "No Slack webhook URL",
                        });
                        break;
                    }
                    if (!isAllowedOutboundUrl(slackUrl)) {
                        results.push({
                            action: "slack_message",
                            status: "failed",
                            detail: "URL not allowed (must be HTTPS, public host)",
                        });
                        break;
                    }
                    try {
                        const slackPayload = {
                            text:
                                (action.config.text as string) ||
                                `Automation triggered: ${triggerRecord.name || triggerRecord.title || triggerRecord.id}`,
                            channel: (action.config.channel as string) || undefined,
                            username: (action.config.username as string) || "ATLVS Automations",
                            icon_emoji: ":zap:",
                        };
                        const slackRes = await fetch(slackUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(slackPayload),
                            signal: AbortSignal.timeout(10_000),
                        });
                        results.push({
                            action: "slack_message",
                            status: slackRes.ok ? "success" : "failed",
                            detail: slackRes.ok ? "Slack message sent" : `HTTP ${slackRes.status}`,
                        });
                    } catch {
                        results.push({
                            action: "slack_message",
                            status: "failed",
                            detail: "Slack request failed",
                        });
                    }
                    break;
                }
                case "add_comment": {
                    await serverFromTable(supabase, "record_comments").insert({
                        entity_type:
                            (action.config.entity_type as string) ||
                            triggerRecord.entity_type ||
                            "",
                        entity_id: triggerRecord.id,
                        body: (action.config.body as string) || "Automated comment",
                        is_system: true,
                        organization_id: orgId,
                    });
                    results.push({ action: "add_comment", status: "success" });
                    break;
                }
                default:
                    results.push({
                        action: action.type,
                        status: "skipped",
                        detail: "Unknown action type",
                    });
            }
        } catch {
            results.push({
                action: action.type,
                status: "failed",
                detail: "Action execution error",
            });
        }
    }
    return results;
}

// C-002: Wrap with server-side RBAC — requires "automations" + "manage" permission
export const POST = withPermission("automations", "manage", async (request, { orgId }) => {
    const startTime = Date.now();
    const supabase = await getServerSupabase();

    try {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(automationExecuteSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { trigger_type, entity_type, record } = result.data;

        // Fetch matching active automations scoped to user's org
        const { data: automations, error: fetchErr } = await serverFromTable(
            supabase,
            "automations"
        )
            .select("*")
            .eq("status", "active")
            .eq("entity_type", entity_type)
            .eq("trigger_type", trigger_type)
            .eq("organization_id", orgId);

        if (fetchErr) throw fetchErr;
        if (!automations || (automations as unknown[]).length === 0) {
            return NextResponse.json({ executed: 0, message: "No matching automations" });
        }

        const results = [];

        for (const automation of automations as unknown[] as AutomationRule[]) {
            const execStart = Date.now();

            // Evaluate conditions
            const conditionsMet = await evaluateConditions(automation.conditions || [], record);

            // Create execution record
            const { data: execRecord } = await serverFromTable(supabase, "automation_executions")
                .insert({
                    automation_id: automation.id,
                    trigger_record_type: entity_type,
                    trigger_record_id: record.id,
                    status: conditionsMet ? "running" : "skipped",
                    organization_id: automation.organization_id,
                })
                .select()
                .single();

            if (!conditionsMet) {
                await serverFromTable(supabase, "automation_executions")
                    .update({
                        status: "skipped",
                        error: "Conditions not met",
                        duration_ms: Date.now() - execStart,
                        completed_at: new Date().toISOString(),
                    })
                    .eq("id", (execRecord as { id: string })?.id);

                results.push({ automation: automation.name, status: "skipped" });
                continue;
            }

            // Execute actions
            const actionResults = await executeActions(
                supabase,
                automation.actions as unknown as AutomationAction[],
                record,
                automation.organization_id
            );

            const hasFailure = actionResults.some((r) => r.status === "failed");
            const duration = Date.now() - execStart;

            // Update execution record
            await serverFromTable(supabase, "automation_executions")
                .update({
                    status: hasFailure ? "failed" : "success",
                    actions_executed: actionResults,
                    duration_ms: duration,
                    completed_at: new Date().toISOString(),
                    error: hasFailure
                        ? actionResults.find((r) => r.status === "failed")?.detail
                        : null,
                })
                .eq("id", (execRecord as { id: string })?.id);

            // Update automation stats
            await serverFromTable(supabase, "automations")
                .update({
                    last_triggered_at: new Date().toISOString(),
                    trigger_count: automation.trigger_count ? automation.trigger_count + 1 : 1,
                    error_count: hasFailure
                        ? (automation.error_count || 0) + 1
                        : automation.error_count || 0,
                })
                .eq("id", automation.id);

            results.push({
                automation: automation.name,
                status: hasFailure ? "failed" : "success",
                actions: actionResults,
                duration_ms: duration,
            });
        }

        return NextResponse.json({
            executed: results.length,
            total_duration_ms: Date.now() - startTime,
            results,
        });
    } catch (_error) {
        return ApiErrors.internalError("Automation execution failed");
    }
});
