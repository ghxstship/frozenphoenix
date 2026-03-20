"use client";

import { useApproval, useDeleteApproval, useUpdateApproval } from "@/lib/supabase";
import {
    useApprovalDecision,
    useApprovalInstanceStatus,
    useCancelApproval,
    useEscalateApproval,
    useInitiateApproval,
} from "@/lib/supabase/hooks-approval-engine";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle2, Loader2, Shield, XCircle } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "approval",
    titleKey: "milestone_name",
    subtitleKey: "milestone_id",
    statusKey: "status",
    icon: Shield,
    backHref: "/approvals",
    backLabel: "Approvals",
    chatterRecordType: "approval",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "milestone_name", label: "Milestone", accessorKey: "milestone_name" },
        { id: "deadline", label: "Deadline", accessorKey: "deadline", fieldType: "date" },
        { id: "approved_at", label: "Approved", accessorKey: "approved_at", fieldType: "date" },
        {
            id: "timeline_impact_days",
            label: "Timeline Impact",
            accessorKey: "timeline_impact_days",
        },
    ],
    fields: [
        { id: "requested_at", label: "Requested", accessorKey: "requested_at", fieldType: "date" },
        { id: "deadline", label: "Deadline", accessorKey: "deadline", fieldType: "date" },
        { id: "approver_id", label: "Approver", accessorKey: "approver_id" },
        { id: "deliverable_url", label: "Deliverable", accessorKey: "deliverable_url" },
    ],
};

export function ApprovalDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: approval, isLoading } = useApproval(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Approval",
        listPath: "/approvals",
        useUpdateHook: useUpdateApproval,
        useDeleteHook: useDeleteApproval,
    });

    const initiateApproval = useInitiateApproval();
    const approvalDecision = useApprovalDecision();
    const escalateApproval = useEscalateApproval();
    const cancelApproval = useCancelApproval();
    const isBusy =
        initiateApproval.isPending ||
        approvalDecision.isPending ||
        escalateApproval.isPending ||
        cancelApproval.isPending;

    const rec = (approval ?? initialRecord) as Record<string, unknown> | null;
    const status = rec?.status as string | undefined;
    const instanceId = (rec?.approval_instance_id as string) ?? "";
    const { data: _instanceStatus } = useApprovalInstanceStatus(instanceId || undefined);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                ...(status === "pending" && instanceId
                    ? [
                          {
                              label: "Escalate",
                              onClick: () =>
                                  escalateApproval.mutate({
                                      instance_id: instanceId,
                                      reason: "Escalated by reviewer",
                                  } as never),
                          },
                          {
                              label: "Cancel Approval",
                              onClick: () =>
                                  cancelApproval.mutate({
                                      instance_id: instanceId,
                                      reason: "Cancelled by reviewer",
                                  } as never),
                          },
                      ]
                    : []),
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                status === "pending" && !instanceId ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                                initiateApproval.mutate({
                                    workflowId: (rec?.workflow_id as string) ?? "",
                                    entityId: id,
                                    entityType: "approval",
                                    entityName: (rec?.milestone_name as string) ?? "",
                                })
                            }
                        >
                            {initiateApproval.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 motion-safe:animate-spin" />
                            ) : (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                            )}
                            Initiate Workflow
                        </Button>
                    </div>
                ) : status === "pending" && instanceId ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                                approvalDecision.mutate({
                                    instance_id: instanceId,
                                    decision: "approved",
                                    comment: "",
                                } as never)
                            }
                        >
                            {approvalDecision.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 motion-safe:animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Approve
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                                approvalDecision.mutate({
                                    instance_id: instanceId,
                                    decision: "rejected",
                                    comment: "",
                                } as never)
                            }
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                                escalateApproval.mutate({
                                    instance_id: instanceId,
                                    reason: "Escalated by reviewer",
                                } as never)
                            }
                        >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Escalate
                        </Button>
                    </div>
                ) : undefined
            }
        />
    );
}
