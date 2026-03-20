import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/automations/email-sequence
 *
 * Gap #4: Email sequence / cadence automation
 * Enqueues a multi-step email drip sequence for a lead or contact.
 * Steps are stored in automation_rules with delays between them.
 * The automation-scheduler picks up pending steps when their send_at time arrives.
 *
 * Body: { automation_id: string, recipient_email: string, recipient_name: string, entity_type?: string, entity_id?: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/automations/email-sequence",
        mutation: true,
        rbac: { resource: "automations", action: "write" },
    },
    async (request, { supabase, orgId, log }) => {
        const body = await request.json();
        const { automation_id, recipient_email, recipient_name, entity_type, entity_id } = body;

        if (!automation_id || !recipient_email) {
            return ApiErrors.badRequest("automation_id and recipient_email are required");
        }

        // Fetch the sequence automation with its steps
        const { data: automation, error: fetchErr } = await serverFromTable(supabase, "automations")
            .select("*, automation_rules(*)")
            .eq("id", automation_id)
            .eq("organization_id", orgId)
            .eq("is_active", true)
            .single();

        if (fetchErr || !automation) {
            return ApiErrors.notFound("Automation (or inactive)");
        }

        const auto = automation as Record<string, unknown>;
        const rules = ((auto.automation_rules as Array<Record<string, unknown>>) ?? [])
            .filter((r) => r.action_type === "send_email" && r.is_active !== false)
            .sort((a, b) => ((a.step_order as number) ?? 0) - ((b.step_order as number) ?? 0));

        if (rules.length === 0) {
            return ApiErrors.notFound("No email steps found in this automation");
        }

        // Create execution record
        const { data: execution } = await serverFromTable(supabase, "automation_executions")
            .insert({
                automation_id,
                trigger_record_type: entity_type ?? "lead",
                trigger_record_id: entity_id ?? null,
                status: "running",
                organization_id: orgId,
            })
            .select("id")
            .single();

        const execId = (execution as Record<string, unknown>)?.id as string | null;
        const now = Date.now();
        let accumulatedDelay = 0;
        const scheduledSteps: Array<{ step: number; subject: string; send_at: string }> = [];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]!;
            const config = (rule.action_config as Record<string, unknown>) ?? {};
            const delayMinutes = (config.delay_minutes as number) ?? i * 24 * 60; // Default: 1 day between steps
            accumulatedDelay += delayMinutes * 60 * 1000;

            const sendAt = new Date(now + accumulatedDelay).toISOString();
            const subject = (config.subject as string) ?? `Step ${i + 1}`;
            const bodyTemplate = (config.body as string) ?? "";

            // Interpolate recipient name into template
            const interpolatedBody = bodyTemplate
                .replace(/\{\{name\}\}/g, recipient_name ?? "")
                .replace(/\{\{email\}\}/g, recipient_email);

            // Schedule the email via scheduled_messages or a dedicated queue
            await serverFromTable(supabase, "scheduled_messages").insert({
                channel: "email",
                recipient: recipient_email,
                subject,
                body: interpolatedBody,
                scheduled_for: sendAt,
                status: "pending",
                metadata: {
                    automation_id,
                    execution_id: execId,
                    step: i + 1,
                    entity_type,
                    entity_id,
                    recipient_name,
                },
                organization_id: orgId,
            });

            scheduledSteps.push({ step: i + 1, subject, send_at: sendAt });
        }

        // Update execution
        if (execId) {
            await serverFromTable(supabase, "automation_executions")
                .update({
                    status: "success",
                    actions_executed: scheduledSteps,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", execId);
        }

        // Update automation stats
        await serverFromTable(supabase, "automations")
            .update({
                last_triggered_at: new Date().toISOString(),
                trigger_count: ((auto.trigger_count as number) ?? 0) + 1,
            })
            .eq("id", automation_id);

        log.info("Email sequence enqueued", {
            automation_id,
            steps: scheduledSteps.length,
            recipient: recipient_email,
        });

        return NextResponse.json(
            {
                data: {
                    execution_id: execId,
                    steps_scheduled: scheduledSteps.length,
                    recipient_email,
                    steps: scheduledSteps,
                },
            },
            { status: 201 }
        );
    }
);
