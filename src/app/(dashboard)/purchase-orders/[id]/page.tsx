"use client";

import { useParams } from "next/navigation";
import {
    useDeletePurchaseOrder,
    usePurchaseOrder,
    useUpdatePurchaseOrder,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, Package, Truck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "purchase_orders",
    titleFn: (r) => `PO ${String(r.id ?? "").slice(0, 8)}`,
    statusKey: "status",
    icon: FileText,
    backHref: "/purchase-orders",
    backLabel: "Purchase Orders",
    chatterRecordType: "purchase_order",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "total_amount", label: "Total", accessorKey: "total_amount", fieldType: "currency" },
        { id: "issued_date", label: "Issued", accessorKey: "issued_date", fieldType: "date" },
        { id: "vendor_id", label: "Vendor", accessorKey: "vendor_id" },
    ],
    fields: [
        {
            id: "total_amount",
            label: "Total Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        { id: "issued_date", label: "Issue Date", accessorKey: "issued_date", fieldType: "date" },
        { id: "vendor_id", label: "Vendor", accessorKey: "vendor_id" },
    ],
    tabs: [
        {
            id: "items",
            label: "Line Items",
            content: (
                <EmptyState
                    icon={Package}
                    title="No line items"
                    description="Line items will load from the purchase_order_items table once linked."
                    compact
                />
            ),
        },
    ],
};

export default function PurchaseOrderDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: po, isLoading } = usePurchaseOrder(entityId);
    const updatePo = useUpdatePurchaseOrder();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Purchase Order",
        listPath: "/purchase-orders",
        useUpdateHook: useUpdatePurchaseOrder,
        useDeleteHook: useDeletePurchaseOrder,
    });

    const poRecord = po as Record<string, unknown> | null;
    const status = poRecord?.status as string | undefined;

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={poRecord}
            isLoading={isLoading}
            menuItems={crudMenuItems}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                status === "draft" ? (
                    <Button
                        size="sm"
                        disabled={updatePo.isPending}
                        onClick={() => updatePo.mutate({ id: entityId, status: "issued" })}
                    >
                        <Truck className="h-4 w-4 mr-1" />
                        Issue PO
                    </Button>
                ) : status === "issued" ? (
                    <Button
                        size="sm"
                        disabled={updatePo.isPending}
                        onClick={() => updatePo.mutate({ id: entityId, status: "received" })}
                    >
                        <Package className="h-4 w-4 mr-1" />
                        Mark Received
                    </Button>
                ) : undefined
            }
        />
    );
}
