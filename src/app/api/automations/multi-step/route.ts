import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/automations/multi-step
 *
 * Gap #15: Multi-step automation engine
 * Executes a multi-step automation sequence with if/then/else branching,
 * delays, and sequential action chains.
 *
 * Body: { automation_id: string, trigger_record_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/automations/multi-step",
        mutation: true,
        rbac: { resource: "automations", action: "write" },
    },
    async (request, { supabase, orgId, log }) => {
        const body = await request.json();
        const { automation_id, trigger_record_id } = body;

        if (!automation_id || !trigger_record_id) {
            return ApiErrors.badRequest("automation_id and trigger_record_id are required");
        }

        // Fetch automation with its rules (steps) ordered by step_order
        const { data: automation, error: fetchErr } = await serverFromTable(supabase, "automations")
            .select("*, automation_rules(*)")
            .eq("id", automation_id)
            .eq("organization_id", orgId)
            .single();

        if (fetchErr || !automation) {
            return ApiErrors.notFound("Automation");
        }

        const auto = automation as Record<string, unknown>;
        const entityType = auto.entity_type as string;
        const rules = ((auto.automation_rules as Array<Record<string, unknown>>) ?? []).sort(
            (a, b) => ((a.step_order as number) ?? 0) - ((b.step_order as number) ?? 0)
        );

        if (rules.length === 0) {
            return NextResponse.json({ data: { executed: 0, message: "No steps defined" } });
        }

        // Fetch trigger record
        const { data: record, error: recordErr } = await serverFromTable(supabase, entityType)
            .select("*")
            .eq("id", trigger_record_id)
            .single();

        if (recordErr || !record) {
            return ApiErrors.notFound("Trigger record");
        }

        // Create execution record
        const { data: execution } = await serverFromTable(supabase, "automation_executions")
            .insert({
                automation_id,
                trigger_record_type: entityType,
                trigger_record_id: trigger_record_id,
                status: "running",
                organization_id: orgId,
            })
            .select("id")
            .single();

        const execId = (execution as Record<string, unknown>)?.id as string | null;
        const startTime = Date.now();
        const stepResults: Array<{
            step: number;
            action: string;
            status: string;
            detail?: string;
        }> = [];
        let currentRecord = record as Record<string, unknown>;

        // Execute each step sequentially
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]!;
            const stepNum = i + 1;
            const actionType = rule.action_type as string;
            const actionConfig = (rule.action_config as Record<string, unknown>) ?? {};
            const conditions =
                (rule.conditions as Array<{ field: string; operator: string; value: unknown }>) ??
                [];

            // Evaluate conditions (branching)
            const conditionsMet = evaluateStepConditions(conditions, currentRecord);

            if (!conditionsMet) {
                stepResults.push({
                    step: stepNum,
                    action: actionType,
                    status: "skipped",
                    detail: "Conditions not met",
                });
                continue;
            }

            // Handle delay steps
            if (actionType === "delay") {
                const delayMs = ((actionConfig.minutes as number) ?? 0) * 60 * 1000;
                if (delayMs > 0 && delayMs <= 300000) {
                    // Max 5 min inline delay
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                } else if (delayMs > 300000) {
                    // Schedule continuation for longer delays
                    const resumeAt = new Date(Date.now() + delayMs).toISOString();
                    if (execId) {
                        await serverFromTable(supabase, "automation_executions")
                            .update({
                                status: "waiting",
                                actions_executed: stepResults,
                                error: `Waiting until ${resumeAt} to resume at step ${stepNum + 1}`,
                            })
                            .eq("id", execId);
                    }
                    stepResults.push({
                        step: stepNum,
                        action: "delay",
                        status: "scheduled",
                        detail: `Resume at ${resumeAt}`,
                    });
                    break;
                }
                stepResults.push({
                    step: stepNum,
                    action: "delay",
                    status: "success",
                    detail: `${actionConfig.minutes}m`,
                });
                continue;
            }

            // Execute action via the automation-trigger-listener pattern
            try {
                const result = await executeStepAction(
                    supabase,
                    actionType,
                    actionConfig,
                    currentRecord,
                    orgId
                );
                stepResults.push({ step: stepNum, action: actionType, ...result });

                // If the action updated a field, refresh the record for subsequent steps
                if (actionType === "update_field") {
                    const { data: refreshed } = await serverFromTable(supabase, entityType)
                        .select("*")
                        .eq("id", trigger_record_id)
                        .single();
                    if (refreshed) currentRecord = refreshed as Record<string, unknown>;
                }
            } catch (err) {
                stepResults.push({
                    step: stepNum,
                    action: actionType,
                    status: "failed",
                    detail: (err as Error).message,
                });
                log.error(`Multi-step automation step ${stepNum} failed`, {
                    error: (err as Error).message,
                });
                break; // Stop execution on failure
            }
        }

        const duration = Date.now() - startTime;
        const hasFailure = stepResults.some((r) => r.status === "failed");

        // Update execution record
        if (execId) {
            await serverFromTable(supabase, "automation_executions")
                .update({
                    status: hasFailure ? "failed" : "success",
                    actions_executed: stepResults,
                    duration_ms: duration,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", execId);
        }

        return NextResponse.json({
            data: {
                execution_id: execId,
                steps_executed: stepResults.length,
                status: hasFailure ? "failed" : "success",
                duration_ms: duration,
                steps: stepResults,
            },
        });
    }
);

function evaluateStepConditions(
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
            default:
                return true;
        }
    });
}

async function executeStepAction(
    supabase: Parameters<typeof serverFromTable>[0],
    actionType: string,
    config: Record<string, unknown>,
    record: Record<string, unknown>,
    orgId: string
): Promise<{ status: string; detail?: string }> {
    switch (actionType) {
        case "send_notification": {
            const userId = (config.user_id as string) || (record.assigned_to as string);
            if (!userId) return { status: "skipped", detail: "No target user" };
            await serverFromTable(supabase, "notifications").insert({
                user_id: userId,
                type: "automation",
                title: (config.title as string) || "Automation step executed",
                message:
                    (config.body as string) ||
                    `Automation action for ${record.name || record.title || record.id}`,
                action_url: (config.action_url as string) || null,
                organization_id: orgId,
            });
            return { status: "success" };
        }
        case "update_field": {
            const table = (config.table as string) || "";
            const field = config.field as string;
            const value = config.value;
            if (table && field && record.id) {
                await serverFromTable(supabase, table)
                    .update({ [field]: value })
                    .eq("id", record.id);
                return { status: "success", detail: `${field} = ${String(value)}` };
            }
            return { status: "failed", detail: "Missing table, field, or record ID" };
        }
        case "create_task": {
            await serverFromTable(supabase, "tasks").insert({
                title:
                    (config.title as string) || `Follow-up: ${record.name || record.title || ""}`,
                description:
                    (config.description as string) || "Auto-created by multi-step automation",
                project_id: record.project_id || null,
                assigned_to: config.assigned_to || record.assigned_to || null,
                status: "todo",
                priority: config.priority || "medium",
                organization_id: orgId,
            });
            return { status: "success" };
        }
        case "move_stage": {
            const table = (config.table as string) || "";
            const newStage = config.stage as string;
            if (table && newStage && record.id) {
                await serverFromTable(supabase, table)
                    .update({ status: newStage })
                    .eq("id", record.id);
                return { status: "success", detail: `→ ${newStage}` };
            }
            return { status: "failed", detail: "Missing parameters" };
        }
        case "add_comment": {
            await serverFromTable(supabase, "record_comments").insert({
                entity_type: (config.entity_type as string) || "",
                entity_id: record.id,
                body: (config.body as string) || "Automated comment from multi-step workflow",
                is_system: true,
                organization_id: orgId,
            });
            return { status: "success" };
        }
        default:
            return { status: "skipped", detail: `Unknown action: ${actionType}` };
    }
}
