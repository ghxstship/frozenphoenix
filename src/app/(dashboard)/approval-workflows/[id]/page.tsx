"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/layouts/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DetailPageShell } from "@/components/shells";
import { formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Activity,
    CheckCircle2,
    ChevronRight,
    Clock,
    GitBranch,
    Play,
    Users,
    Workflow,
} from "lucide-react";

interface StepDef {
    id: string;
    name: string;
    step_order: number;
    step_type: string;
    approver_role: string | null;
    approver_user_ids: string[] | null;
}

interface InstanceView {
    id: string;
    entity_name: string;
    entity_type: string;
    entity_id: string;
    status: string;
    current_step_id: string | null;
    initiated_by: string;
    initiated_at: string;
    completed_at: string | null;
}

export default function ApprovalWorkflowDetailPage() {
    const params = useParams();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<Record<string, unknown> | null>(null);
    const [steps, setSteps] = useState<StepDef[]>([]);
    const [instances, setInstances] = useState<InstanceView[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/approval-workflows?id=${workflowId}`);
                if (res.ok) {
                    const data = await res.json();
                    const items = data.data ?? [];
                    if (items.length > 0) setWorkflow(items[0]);
                }

                const stepsRes = await fetch(
                    `/api/approval-steps?workflow_id=${workflowId}&sort_by=step_order&sort_order=asc`
                );
                if (stepsRes.ok) {
                    const stepsData = await stepsRes.json();
                    setSteps(
                        (stepsData.data ?? []).map((s: Record<string, unknown>) => ({
                            id: s.id as string,
                            name: (s.name as string) || `Step ${s.step_order}`,
                            step_order: (s.step_order as number) ?? 0,
                            step_type: (s.step_type as string) || "single",
                            approver_role: (s.approver_role as string) ?? null,
                            approver_user_ids: (s.approver_user_ids as string[]) ?? null,
                        }))
                    );
                }

                const instRes = await fetch(
                    `/api/approvals?workflow_id=${workflowId}&sort_by=initiated_at&sort_order=desc`
                );
                if (instRes.ok) {
                    const instData = await instRes.json();
                    setInstances(
                        (instData.data ?? []).map((inst: Record<string, unknown>) => ({
                            id: inst.id as string,
                            entity_name: (inst.entity_name as string) || "Unnamed",
                            entity_type: (inst.entity_type as string) || "",
                            entity_id: (inst.entity_id as string) || "",
                            status: (inst.status as string) || "pending",
                            current_step_id: (inst.current_step_id as string) ?? null,
                            initiated_by: (inst.initiated_by as string) || "",
                            initiated_at: (inst.initiated_at as string) || "",
                            completed_at: (inst.completed_at as string) ?? null,
                        }))
                    );
                }
            } catch {
                // Silently handle — user sees empty state
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [workflowId]);

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
                return "destructive";
            case "escalated":
                return "destructive";
            default:
                return "ghost";
        }
    };

    const config: DetailPageConfig = {
        entityKey: "approval_workflows",
        titleFn: () => wfName,
        subtitleFn: () =>
            `${steps.length}-step approval workflow — entity type: ${(workflow?.entity_type as string) ?? ""}`,
        statusFn: () => wfStatus,
        icon: Workflow,
        backHref: "/approval-workflows",
        backLabel: "Approval Workflows",
        fields: [],
        stats: [
            { label: "Total Instances", icon: GitBranch, compute: () => instances.length },
            { label: "Active", icon: Play, compute: () => activeInstances.length },
            { label: "Completed", icon: CheckCircle2, compute: () => completedInstances.length },
            { label: "Steps", icon: Activity, compute: () => steps.length },
        ],
        chatter: false,
        tabs: [
            {
                id: "instances",
                label: "Instances",
                icon: GitBranch,
                count: activeInstances.length,
                content:
                    instances.length === 0 ? (
                        <EmptyState
                            icon={GitBranch}
                            title="No workflow instances"
                            description="Instances will appear here when the workflow is initiated for an entity."
                        />
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
                                                </div>
                                            </div>

                                            {/* Step progress bar */}
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
                                                                className={`h-2 flex-1 rounded-full transition-all ${
                                                                    isPast ||
                                                                    inst.status === "completed"
                                                                        ? "bg-success"
                                                                        : isCurrent
                                                                          ? "bg-primary animate-pulse"
                                                                          : "bg-muted"
                                                                }`}
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
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={workflowId}
            record={workflow}
            isLoading={isLoading}
            actions={
                <Badge variant={wfStatus === "active" ? "success" : "ghost"}>{wfStatus}</Badge>
            }
        />
    );
}
