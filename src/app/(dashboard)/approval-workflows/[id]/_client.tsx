"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/layouts/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailPageShell } from "@/components/shells";
import {
    useApprovalSteps,
    useApprovalWorkflow,
    useCreateApprovalStep,
    useCreateWorkflowInstance,
    useUpdateWorkflowInstance,
    useWorkflowInstances,
    useWorkflowStepApprovals,
} from "@/lib/supabase/hooks-workflows";
import { formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Activity,
    CheckCircle2,
    ChevronRight,
    Clock,
    GitBranch,
    Loader2,
    Play,
    ShieldCheck,
    Users,
    Workflow,
} from "lucide-react";

function StepApprovalsTab({ instanceId }: { instanceId: string }) {
    const { data: approvals, isLoading } = useWorkflowStepApprovals(instanceId);
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!approvals || approvals.length === 0)
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No step approvals recorded for this instance.
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Step Approvals ({approvals.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {approvals.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {a.approval_steps?.name ??
                                        `Step ${a.approval_steps?.step_order ?? "?"}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {a.user_profiles?.display_name ?? "Unknown"}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    String(a.decision) === "approved"
                                        ? "success"
                                        : String(a.decision) === "rejected"
                                          ? "destructive"
                                          : "ghost"
                                }
                            >
                                {String(a.decision ?? "pending")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ApprovalWorkflowDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: workflowData, isLoading: wfLoading } = useApprovalWorkflow(id);
    const { data: stepsData, isLoading: stepsLoading } = useApprovalSteps(id);
    const { data: instancesData, isLoading: instLoading } = useWorkflowInstances();
    const createStep = useCreateApprovalStep();
    const createInstance = useCreateWorkflowInstance();
    const updateInstance = useUpdateWorkflowInstance();

    const isLoading = wfLoading || stepsLoading || instLoading;
    const workflow = (workflowData ?? initialRecord) as Record<string, unknown> | null;

    const steps = useMemo(
        () =>
            (stepsData ?? []).map((s) => ({
                id: s.id,
                name: s.name || `Step ${s.step_order}`,
                step_order: s.step_order ?? 0,
                step_type: String(s.step_type ?? "single"),
                approver_role: (s as unknown as Record<string, unknown>).approver_role as
                    | string
                    | null,
                approver_user_ids: (s as unknown as Record<string, unknown>).approver_user_ids as
                    | string[]
                    | null,
            })),
        [stepsData]
    );
    const instances = useMemo(
        () =>
            (instancesData ?? [])
                .filter((i) => i.workflow_id === id)
                .map((inst) => ({
                    id: inst.id,
                    entity_name: String(
                        (inst as unknown as Record<string, unknown>).entity_name ?? "Unnamed"
                    ),
                    entity_type: String(inst.entity_type ?? ""),
                    status: String(inst.status ?? "pending"),
                    current_step_id: (inst.current_step_id as string) ?? null,
                    initiated_at: String(inst.created_at ?? ""),
                    completed_at:
                        ((inst as unknown as Record<string, unknown>).completed_at as string) ??
                        null,
                })),
        [instancesData, id]
    );

    const wfName = (workflow?.name as string) || "Untitled Workflow";
    const wfStatus = (workflow?.status as string) || "draft";
    const activeInstances = instances.filter(
        (i) => i.status === "in_progress" || i.status === "pending"
    );
    const completedInstances = instances.filter((i) => i.status === "completed");

    const statusColor = (s: string) => {
        switch (s) {
            case "completed":
                return "success";
            case "in_progress":
                return "info" as "ghost";
            case "pending":
                return "warning" as "ghost";
            case "cancelled":
            case "escalated":
                return "destructive";
            default:
                return "ghost";
        }
    };

    const config: DetailPageConfig = {
        entityKey: "approval_workflow",
        titleFn: () => wfName,
        subtitleFn: () =>
            `${steps.length}-step approval workflow — entity type: ${(workflow?.entity_type as string) ?? ""}`,
        statusFn: () => wfStatus,
        icon: Workflow,
        backHref: "/approval-workflows",
        backLabel: "Approval Workflows",
        fields: [],
        chatter: false,
        stats: [
            { label: "Total Instances", icon: GitBranch, compute: () => instances.length },
            { label: "Active", icon: Play, compute: () => activeInstances.length },
            { label: "Completed", icon: CheckCircle2, compute: () => completedInstances.length },
            { label: "Steps", icon: Activity, compute: () => steps.length },
        ],
        tabs: [
            {
                id: "instances",
                label: "Instances",
                icon: GitBranch,
                count: activeInstances.length,
                content:
                    instances.length === 0 ? (
                        <div className="density-gap-section">
                            <EmptyState
                                icon={GitBranch}
                                title="No workflow instances"
                                description="Instances will appear here when the workflow is initiated for an entity."
                            />
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={createInstance.isPending || steps.length === 0}
                                    onClick={() => {
                                        createInstance.mutate({
                                            workflow_id: id,
                                            entity_type: (workflow?.entity_type as string) ?? "",
                                            entity_id: "",
                                            status: "pending",
                                        } as Parameters<typeof createInstance.mutate>[0]);
                                    }}
                                >
                                    <GitBranch className="mr-2 h-4 w-4" />
                                    Initiate Workflow
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {instances.map((inst) => {
                                const currentStep = steps.find(
                                    (s) => s.id === inst.current_step_id
                                );
                                return (
                                    <Card key={inst.id}>
                                        <CardContent className="py-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <Badge variant={statusColor(inst.status)}>
                                                        {inst.status.replace(/_/g, " ")}
                                                    </Badge>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-semibold truncate">
                                                            {inst.entity_name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {inst.entity_type} — initiated{" "}
                                                            {formatDate(inst.initiated_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {currentStep && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {currentStep.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {inst.completed_at && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Completed{" "}
                                                            {formatDate(inst.completed_at)}
                                                        </p>
                                                    )}
                                                    {(inst.status === "in_progress" ||
                                                        inst.status === "pending") && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-1"
                                                            disabled={updateInstance.isPending}
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        `Cancel workflow instance for "${inst.entity_name}"?`
                                                                    )
                                                                ) {
                                                                    updateInstance.mutate({
                                                                        id: inst.id,
                                                                        status: "cancelled",
                                                                    } as Parameters<
                                                                        typeof updateInstance.mutate
                                                                    >[0]);
                                                                }
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-1">
                                                {steps.map((step, si) => {
                                                    const isCurrent =
                                                        step.id === inst.current_step_id;
                                                    const isPast = currentStep
                                                        ? step.step_order < currentStep.step_order
                                                        : inst.status === "completed";
                                                    return (
                                                        <div
                                                            key={step.id}
                                                            className="flex items-center gap-1 flex-1"
                                                        >
                                                            <div
                                                                className={`h-2 flex-1 rounded-full transition-all ${isPast || inst.status === "completed" ? "bg-success" : isCurrent ? "bg-primary motion-safe:animate-pulse" : "bg-muted"}`}
                                                                title={step.name}
                                                            />
                                                            {si < steps.length - 1 && (
                                                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ),
            },
            {
                id: "steps",
                label: "Step Design",
                icon: Activity,
                count: steps.length,
                content: (
                    <div className="space-y-3">
                        {steps.map((step, i) => (
                            <Card key={step.id} className="border-l-4 border-l-primary">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold">
                                                    {step.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Type:{" "}
                                                    <Badge variant="ghost" className="ml-1">
                                                        {step.step_type}
                                                    </Badge>
                                                    {step.approver_role && (
                                                        <span className="ml-2">
                                                            Role: {step.approver_role}
                                                        </span>
                                                    )}
                                                    {step.approver_user_ids &&
                                                        step.approver_user_ids.length > 0 && (
                                                            <span className="ml-2 inline-flex items-center gap-1">
                                                                <Users className="h-3 w-3" />{" "}
                                                                {step.approver_user_ids.length}{" "}
                                                                approver
                                                                {step.approver_user_ids.length !== 1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>
                                                        )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {steps.length === 0 && (
                            <EmptyState
                                icon={Activity}
                                title="No steps defined"
                                description="Add steps to define the approval flow."
                            />
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={createStep.isPending}
                            onClick={() => {
                                createStep.mutate({
                                    workflow_id: id,
                                    name: `Step ${steps.length + 1}`,
                                    step_order: steps.length + 1,
                                    step_type: "single",
                                } as Parameters<typeof createStep.mutate>[0]);
                            }}
                        >
                            <Activity className="mr-2 h-4 w-4" />
                            Add Step
                        </Button>
                    </div>
                ),
            },
            {
                id: "designer",
                label: "Visual Flow",
                icon: Workflow,
                content: (
                    <Card>
                        <CardContent className="py-8">
                            <div className="flex flex-col items-center gap-4">
                                {steps.map((step, i) => (
                                    <div
                                        key={step.id}
                                        className="flex flex-col items-center gap-2 w-full max-w-md"
                                    >
                                        <div className="w-full rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-center">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Step {i + 1}
                                            </div>
                                            <div className="font-semibold text-sm">{step.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {step.step_type === "all"
                                                    ? "All must approve"
                                                    : step.step_type === "any"
                                                      ? "Any one can approve"
                                                      : step.step_type === "sequential"
                                                        ? "Sequential approval"
                                                        : "Single approver"}
                                            </div>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-0.5 h-4 bg-primary/30" />
                                                <CheckCircle2 className="h-4 w-4 text-primary/50" />
                                                <div className="w-0.5 h-4 bg-primary/30" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {steps.length > 0 && (
                                    <div className="flex flex-col items-center gap-2 mt-2">
                                        <div className="w-0.5 h-4 bg-success/50" />
                                        <div className="rounded-xl border-2 border-success/30 bg-success/5 p-4 text-center max-w-md w-full">
                                            <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
                                            <div className="font-semibold text-sm text-success">
                                                Workflow Complete
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "step-approvals",
                label: "Step Approvals",
                icon: ShieldCheck,
                content:
                    activeInstances.length > 0 ? (
                        <div className="density-gap-section">
                            {activeInstances.map((inst) => (
                                <div key={inst.id}>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Instance: {inst.entity_name} ({inst.status})
                                    </p>
                                    <StepApprovalsTab instanceId={inst.id} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={ShieldCheck}
                            title="No active instances"
                            description="Step approvals will appear here when a workflow instance is in progress."
                        />
                    ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={workflow}
            isLoading={isLoading && !initialRecord}
            actions={
                <Badge variant={wfStatus === "active" ? "success" : "ghost"}>{wfStatus}</Badge>
            }
        />
    );
}
