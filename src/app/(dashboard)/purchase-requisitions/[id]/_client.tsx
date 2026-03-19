"use client";

import {
    useDeletePurchaseRequisition,
    usePurchaseRequisition,
    useUpdatePurchaseRequisition,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { Button } from "@/components/ui/button";
import { ClipboardList, Send } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "purchase_requisition",
    titleKey: "title",
    subtitleFn: (r) => `${String(r.number ?? "")} · ${String(r.department ?? "No Department")}`,
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/purchase-requisitions",
    backLabel: "Purchase Requisitions",
    chatterRecordType: "purchase_requisition",
    sidebarFields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "urgency", label: "Urgency", accessorKey: "urgency" },
        {
            id: "estimated_cost",
            label: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
        { id: "needed_by", label: "Needed By", accessorKey: "needed_by", fieldType: "date" },
        { id: "department", label: "Department", accessorKey: "department" },
        { id: "budget_code", label: "Budget Code", accessorKey: "budget_code" },
    ],
    fields: [
        {
            id: "estimated_cost",
            label: "Estimated Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
        { id: "needed_by", label: "Needed By", accessorKey: "needed_by", fieldType: "date" },
        {
            id: "justification",
            label: "Justification",
            accessorKey: "justification",
            fullWidth: true,
        },
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
    ],
    tabs: [
        {
            id: "line-items",
            label: "Line Items",
            content: (
                <EmptyState
                    icon={ClipboardList}
                    title="No line items"
                    description="Line items for this requisition will appear here."
                    compact
                />
            ),
        },
    ],
};

export function PurchaseRequisitionDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: req, isLoading } = usePurchaseRequisition(id);
    const updateReq = useUpdatePurchaseRequisition();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Requisition",
        listPath: "/purchase-requisitions",
        useUpdateHook: useUpdatePurchaseRequisition,
        useDeleteHook: useDeletePurchaseRequisition,
    });

    const rec = (req ?? initialRecord) as Record<string, unknown> | null;
    const status = rec?.status as string | undefined;

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={crudMenuItems}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                status === "draft" ? (
                    <Button
                        size="sm"
                        disabled={updateReq.isPending}
                        onClick={() => updateReq.mutate({ id, status: "pending_approval" })}
                    >
                        <Send className="h-4 w-4 mr-1" />
                        Submit for Approval
                    </Button>
                ) : undefined
            }
        />
    );
}
