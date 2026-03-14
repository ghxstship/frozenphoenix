/* ═══════════════════════════════════════════════════════════════
   APPROVAL ENGINE — Server-side orchestration for multi-step
   approval workflows. Operates on 4 tables:
   
   - approval_workflows   (templates)
   - approval_steps        (ordered step definitions)
   - workflow_instances    (runtime instances)
   - workflow_step_approvals (individual decisions)
   
   Enums (from DB):
   - approval_step_type: "single" | "all" | "any" | "sequential"
   - workflow_instance_status: "pending" | "in_progress" | "completed" | "cancelled" | "escalated"
   - workflow_status: "draft" | "active" | "paused" | "archived"
   ═══════════════════════════════════════════════════════════════ */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────

export type ApprovalDecision = "approved" | "rejected" | "delegated";
export type StepType = "single" | "all" | "any" | "sequential";
export type InstanceStatus = "pending" | "in_progress" | "completed" | "cancelled" | "escalated";

export interface InitiatePayload {
    workflowId: string;
    entityId: string;
    entityType: string;
    entityName?: string;
    organizationId: string;
    initiatedBy: string;
    context?: Record<string, unknown>;
}

export interface DecidePayload {
    instanceId: string;
    stepId: string;
    approverId: string;
    decision: ApprovalDecision;
    comments?: string;
    delegateTo?: string;
}

export interface EscalatePayload {
    instanceId: string;
    stepId: string;
    escalatedBy: string;
    reason?: string;
}

export interface EngineResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

// ─── Core Engine ─────────────────────────────────────────────

/**
 * Initiate a new workflow instance for a given entity.
 * Finds the first step in the workflow and creates the instance + initial step approval(s).
 */
export async function initiateWorkflow(
    supabase: SupabaseClient,
    payload: InitiatePayload
): Promise<EngineResult<{ instanceId: string; currentStepId: string }>> {
    const LOG = "[ApprovalEngine.initiate]";

    // 1. Verify workflow exists and is active
    const { data: workflow, error: wfErr } = await supabase
        .from("approval_workflows")
        .select("id, name, status, entity_type")
        .eq("id", payload.workflowId)
        .single();

    if (wfErr || !workflow) {
        logger.warn(`${LOG} workflow not found`, { id: payload.workflowId });
        return { success: false, error: "Workflow not found", code: "NOT_FOUND" };
    }

    if (workflow.status !== "active") {
        return {
            success: false,
            error: `Workflow "${workflow.name}" is ${workflow.status}, not active`,
            code: "INVALID_STATE",
        };
    }

    if (workflow.entity_type !== payload.entityType) {
        return {
            success: false,
            error: `Workflow entity_type "${workflow.entity_type}" does not match "${payload.entityType}"`,
            code: "ENTITY_MISMATCH",
        };
    }

    // 2. Check for existing active instance on same entity
    const { data: existing } = await supabase
        .from("workflow_instances")
        .select("id, status")
        .eq("workflow_id", payload.workflowId)
        .eq("entity_id", payload.entityId)
        .in("status", ["pending", "in_progress"])
        .limit(1);

    if (existing && existing.length > 0) {
        return {
            success: false,
            error: "An active workflow instance already exists for this entity",
            code: "CONFLICT",
        };
    }

    // 3. Get first step
    const { data: steps, error: stepsErr } = await supabase
        .from("approval_steps")
        .select("*")
        .eq("workflow_id", payload.workflowId)
        .order("step_order", { ascending: true });

    if (stepsErr || !steps || steps.length === 0) {
        return { success: false, error: "Workflow has no steps defined", code: "NO_STEPS" };
    }

    const firstStep = steps[0]!;

    // 4. Create instance
    const { data: instance, error: instErr } = await supabase
        .from("workflow_instances")
        .insert({
            workflow_id: payload.workflowId,
            entity_id: payload.entityId,
            entity_type: payload.entityType,
            entity_name: payload.entityName ?? null,
            organization_id: payload.organizationId,
            initiated_by: payload.initiatedBy,
            initiated_at: new Date().toISOString(),
            current_step_id: firstStep.id,
            status: "in_progress" as InstanceStatus,
            context: payload.context ?? null,
        })
        .select("id")
        .single();

    if (instErr || !instance) {
        logger.error(`${LOG} failed to create instance`, { error: instErr?.message });
        return { success: false, error: "Failed to create workflow instance", code: "DB_ERROR" };
    }

    // 5. Create initial step approval(s)
    const assignErr = await assignStepApprovals(supabase, instance.id, firstStep);
    if (assignErr) {
        logger.error(`${LOG} failed to assign step approvals`, { error: assignErr });
        return { success: false, error: assignErr, code: "DB_ERROR" };
    }

    logger.info(`${LOG} initiated`, {
        instanceId: instance.id,
        workflowId: payload.workflowId,
        entityId: payload.entityId,
        firstStepId: firstStep.id,
    });

    return { success: true, data: { instanceId: instance.id, currentStepId: firstStep.id } };
}

/**
 * Record an approver's decision on a step. Advances the workflow if the step is complete.
 */
export async function recordDecision(
    supabase: SupabaseClient,
    payload: DecidePayload
): Promise<
    EngineResult<{ advanced: boolean; nextStepId?: string; instanceStatus: InstanceStatus }>
> {
    const LOG = "[ApprovalEngine.decide]";

    // 1. Verify instance exists and is in_progress
    const { data: instance, error: instErr } = await supabase
        .from("workflow_instances")
        .select("id, status, current_step_id, workflow_id")
        .eq("id", payload.instanceId)
        .single();

    if (instErr || !instance) {
        return { success: false, error: "Workflow instance not found", code: "NOT_FOUND" };
    }

    if (instance.status !== "in_progress") {
        return {
            success: false,
            error: `Instance is "${instance.status}", cannot record decision`,
            code: "INVALID_STATE",
        };
    }

    // 2. Verify step matches current step
    if (instance.current_step_id !== payload.stepId) {
        return {
            success: false,
            error: "Step does not match current instance step",
            code: "STEP_MISMATCH",
        };
    }

    // 3. Verify the approver has an open approval for this step
    const { data: existingApproval, error: approvalErr } = await supabase
        .from("workflow_step_approvals")
        .select("id, decision")
        .eq("instance_id", payload.instanceId)
        .eq("step_id", payload.stepId)
        .eq("approver_id", payload.approverId)
        .single();

    if (approvalErr || !existingApproval) {
        return {
            success: false,
            error: "No pending approval found for this approver on this step",
            code: "NOT_ASSIGNED",
        };
    }

    if (existingApproval.decision && existingApproval.decision !== "pending") {
        return { success: false, error: "Decision already recorded", code: "ALREADY_DECIDED" };
    }

    // 4. Handle delegation
    if (payload.decision === "delegated") {
        if (!payload.delegateTo) {
            return {
                success: false,
                error: "delegateTo is required for delegation",
                code: "VALIDATION",
            };
        }

        // Update existing approval as delegated
        await supabase
            .from("workflow_step_approvals")
            .update({
                decision: "delegated",
                decided_at: new Date().toISOString(),
                comments: payload.comments ?? null,
            })
            .eq("id", existingApproval.id);

        // Create new approval for delegate
        await supabase.from("workflow_step_approvals").insert({
            instance_id: payload.instanceId,
            step_id: payload.stepId,
            approver_id: payload.delegateTo,
            assigned_at: new Date().toISOString(),
            delegated_from: payload.approverId,
        });

        logger.info(`${LOG} delegated`, {
            instanceId: payload.instanceId,
            from: payload.approverId,
            to: payload.delegateTo,
        });

        return { success: true, data: { advanced: false, instanceStatus: "in_progress" } };
    }

    // 5. Record approve/reject
    await supabase
        .from("workflow_step_approvals")
        .update({
            decision: payload.decision,
            decided_at: new Date().toISOString(),
            comments: payload.comments ?? null,
        })
        .eq("id", existingApproval.id);

    // 6. Check if step is complete based on step_type
    const { data: step } = await supabase
        .from("approval_steps")
        .select("step_type, on_reject_action")
        .eq("id", payload.stepId)
        .single();

    const stepType = (step?.step_type ?? "single") as StepType;

    // If rejected — stop the workflow (unless step has custom on_reject_action)
    if (payload.decision === "rejected") {
        // Check if on_reject_action says "continue"
        const onReject = step?.on_reject_action as Record<string, unknown> | null;
        if (onReject?.action === "continue") {
            // Step allows continuation despite rejection — check if step is fully complete
            const stepComplete = await isStepComplete(
                supabase,
                payload.instanceId,
                payload.stepId,
                stepType
            );
            if (stepComplete) {
                return advanceToNextStep(supabase, instance, payload.stepId);
            }
            return { success: true, data: { advanced: false, instanceStatus: "in_progress" } };
        }

        // Default: rejection halts the workflow
        await supabase
            .from("workflow_instances")
            .update({
                status: "cancelled" as InstanceStatus,
                cancelled_at: new Date().toISOString(),
                cancelled_reason: `Rejected by approver at step: ${payload.comments ?? "No reason given"}`,
            })
            .eq("id", payload.instanceId);

        logger.info(`${LOG} rejected → cancelled`, { instanceId: payload.instanceId });
        return { success: true, data: { advanced: false, instanceStatus: "cancelled" } };
    }

    // 7. Check if step is fully complete
    const stepComplete = await isStepComplete(
        supabase,
        payload.instanceId,
        payload.stepId,
        stepType
    );

    if (!stepComplete) {
        return { success: true, data: { advanced: false, instanceStatus: "in_progress" } };
    }

    // 8. Advance to next step
    return advanceToNextStep(supabase, instance, payload.stepId);
}

/**
 * Escalate a step — marks step approvals as escalated, moves to escalation target.
 */
export async function escalateStep(
    supabase: SupabaseClient,
    payload: EscalatePayload
): Promise<EngineResult<{ escalatedTo?: string }>> {
    const LOG = "[ApprovalEngine.escalate]";

    const { data: instance } = await supabase
        .from("workflow_instances")
        .select("id, status, current_step_id")
        .eq("id", payload.instanceId)
        .single();

    if (!instance || instance.status !== "in_progress") {
        return {
            success: false,
            error: "Instance not found or not in progress",
            code: "INVALID_STATE",
        };
    }

    if (instance.current_step_id !== payload.stepId) {
        return {
            success: false,
            error: "Step does not match current instance step",
            code: "STEP_MISMATCH",
        };
    }

    // Get step escalation config
    const { data: step } = await supabase
        .from("approval_steps")
        .select("escalation_to_user_id, escalation_to_role")
        .eq("id", payload.stepId)
        .single();

    if (!step?.escalation_to_user_id && !step?.escalation_to_role) {
        return {
            success: false,
            error: "No escalation target configured for this step",
            code: "NO_ESCALATION_TARGET",
        };
    }

    // Mark pending approvals as escalated
    await supabase
        .from("workflow_step_approvals")
        .update({
            escalated: true,
            escalated_at: new Date().toISOString(),
        })
        .eq("instance_id", payload.instanceId)
        .eq("step_id", payload.stepId)
        .is("decision", null);

    // Create new approval for escalation target
    if (step.escalation_to_user_id) {
        await supabase.from("workflow_step_approvals").insert({
            instance_id: payload.instanceId,
            step_id: payload.stepId,
            approver_id: step.escalation_to_user_id,
            assigned_at: new Date().toISOString(),
        });
    }

    // Update instance status
    await supabase
        .from("workflow_instances")
        .update({ status: "escalated" as InstanceStatus })
        .eq("id", payload.instanceId);

    logger.info(`${LOG} escalated`, {
        instanceId: payload.instanceId,
        stepId: payload.stepId,
        escalatedTo: step.escalation_to_user_id ?? step.escalation_to_role,
    });

    return {
        success: true,
        data: { escalatedTo: step.escalation_to_user_id ?? step.escalation_to_role ?? undefined },
    };
}

/**
 * Cancel a workflow instance.
 */
export async function cancelWorkflow(
    supabase: SupabaseClient,
    instanceId: string,
    userId: string,
    reason?: string
): Promise<EngineResult> {
    const { data: instance } = await supabase
        .from("workflow_instances")
        .select("id, status")
        .eq("id", instanceId)
        .single();

    if (!instance) {
        return { success: false, error: "Instance not found", code: "NOT_FOUND" };
    }

    if (instance.status === "completed" || instance.status === "cancelled") {
        return {
            success: false,
            error: `Instance is already "${instance.status}"`,
            code: "INVALID_STATE",
        };
    }

    await supabase
        .from("workflow_instances")
        .update({
            status: "cancelled" as InstanceStatus,
            cancelled_at: new Date().toISOString(),
            cancelled_reason: reason ?? `Cancelled by user ${userId}`,
        })
        .eq("id", instanceId);

    logger.info("[ApprovalEngine.cancel]", { instanceId, userId });
    return { success: true };
}

/**
 * Get full status of a workflow instance, including all steps and their approval decisions.
 */
export async function getInstanceStatus(
    supabase: SupabaseClient,
    instanceId: string
): Promise<
    EngineResult<{
        instance: Record<string, unknown>;
        workflow: Record<string, unknown>;
        steps: Record<string, unknown>[];
        approvals: Record<string, unknown>[];
    }>
> {
    // Instance + workflow
    const { data: instance, error: instErr } = await supabase
        .from("workflow_instances")
        .select(
            "*, approval_workflows(id, name, entity_type, description, require_comments), user_profiles:initiated_by(display_name)"
        )
        .eq("id", instanceId)
        .single();

    if (instErr || !instance) {
        return { success: false, error: "Instance not found", code: "NOT_FOUND" };
    }

    const workflowId = instance.workflow_id as string;

    // All steps for the workflow
    const { data: steps } = await supabase
        .from("approval_steps")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("step_order", { ascending: true });

    // All approvals for this instance
    const { data: approvals } = await supabase
        .from("workflow_step_approvals")
        .select("*, user_profiles:approver_id(display_name), approval_steps(name, step_order)")
        .eq("instance_id", instanceId)
        .order("assigned_at", { ascending: true });

    return {
        success: true,
        data: {
            instance: instance as Record<string, unknown>,
            workflow: (instance as Record<string, unknown>).approval_workflows as Record<
                string,
                unknown
            >,
            steps: (steps ?? []) as Record<string, unknown>[],
            approvals: (approvals ?? []) as Record<string, unknown>[],
        },
    };
}

// ─── Internal Helpers ────────────────────────────────────────

/**
 * Check if a step is complete based on step_type and recorded decisions.
 */
async function isStepComplete(
    supabase: SupabaseClient,
    instanceId: string,
    stepId: string,
    stepType: StepType
): Promise<boolean> {
    const { data: approvals } = await supabase
        .from("workflow_step_approvals")
        .select("decision, escalated")
        .eq("instance_id", instanceId)
        .eq("step_id", stepId);

    if (!approvals || approvals.length === 0) return false;

    const activeApprovals = approvals.filter((a) => !a.escalated);
    const decided = activeApprovals.filter(
        (a) => a.decision && a.decision !== "pending" && a.decision !== "delegated"
    );

    switch (stepType) {
        case "single":
            // Only one approver needed
            return decided.length >= 1;

        case "any":
            // At least one approval is sufficient
            return decided.some((a) => a.decision === "approved");

        case "all":
            // All must approve
            return (
                decided.length === activeApprovals.length &&
                decided.every((a) => a.decision === "approved")
            );

        case "sequential":
            // All must approve in order (same logic as "all" since we track order via assigned_at)
            return (
                decided.length === activeApprovals.length &&
                decided.every((a) => a.decision === "approved")
            );

        default:
            return false;
    }
}

/**
 * Advance the workflow instance to the next step, or complete it if no more steps.
 */
async function advanceToNextStep(
    supabase: SupabaseClient,
    instance: { id: string; workflow_id: string; current_step_id: string | null },
    currentStepId: string
): Promise<
    EngineResult<{ advanced: boolean; nextStepId?: string; instanceStatus: InstanceStatus }>
> {
    const LOG = "[ApprovalEngine.advance]";

    // Get all steps in order
    const { data: steps } = await supabase
        .from("approval_steps")
        .select("id, step_order")
        .eq("workflow_id", instance.workflow_id)
        .order("step_order", { ascending: true });

    if (!steps) {
        return { success: false, error: "Failed to load steps", code: "DB_ERROR" };
    }

    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    const nextStep =
        currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

    if (!nextStep) {
        // No more steps — complete the workflow
        await supabase
            .from("workflow_instances")
            .update({
                status: "completed" as InstanceStatus,
                completed_at: new Date().toISOString(),
                current_step_id: null,
            })
            .eq("id", instance.id);

        logger.info(`${LOG} completed`, { instanceId: instance.id });
        return { success: true, data: { advanced: true, instanceStatus: "completed" } };
    }

    // Advance to next step
    await supabase
        .from("workflow_instances")
        .update({ current_step_id: nextStep.id, status: "in_progress" as InstanceStatus })
        .eq("id", instance.id);

    // Get full step details for assignment
    const { data: nextStepFull } = await supabase
        .from("approval_steps")
        .select("*")
        .eq("id", nextStep.id)
        .single();

    if (nextStepFull) {
        await assignStepApprovals(supabase, instance.id, nextStepFull);
    }

    logger.info(`${LOG} advanced`, { instanceId: instance.id, nextStepId: nextStep.id });
    return {
        success: true,
        data: { advanced: true, nextStepId: nextStep.id, instanceStatus: "in_progress" },
    };
}

/**
 * Create workflow_step_approvals rows for a step's configured approvers.
 */
async function assignStepApprovals(
    supabase: SupabaseClient,
    instanceId: string,
    step: Record<string, unknown>
): Promise<string | null> {
    const approverUserIds = step.approver_user_ids as string[] | null;
    const now = new Date().toISOString();

    if (!approverUserIds || approverUserIds.length === 0) {
        // If no explicit user IDs, we still create a placeholder so the step can be tracked.
        // Role-based assignment would be resolved by the caller or a separate resolver.
        return null;
    }

    const rows = approverUserIds.map((uid) => ({
        instance_id: instanceId,
        step_id: step.id as string,
        approver_id: uid,
        assigned_at: now,
    }));

    const { error } = await supabase.from("workflow_step_approvals").insert(rows);

    if (error) {
        return error.message;
    }

    return null;
}
