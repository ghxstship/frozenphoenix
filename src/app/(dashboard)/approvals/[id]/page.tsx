"use client";

import { useParams } from "next/navigation";
import { useApproval } from "@/lib/supabase";
import { useUpdateApproval } from "@/lib/supabase";
import { useDeleteApproval } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "approvals",
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

export default function ApprovalDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: approval, isLoading } = useApproval(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Approval",
        listPath: "/approvals",
        useUpdateHook: useUpdateApproval,
        useDeleteHook: useDeleteApproval,
    });

    const rec = approval as Record<string, unknown> | null;
    const status = rec?.status as string | undefined;

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={rec}
            isLoading={isLoading}
            menuItems={crudMenuItems}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                status === "pending" ? (
                    <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                ) : undefined
            }
        />
    );
}
