"use client";

import { ListPageShell } from "@/components/shells";
import { usePurchaseRequisitions } from "@/lib/supabase/hooks-pages";
import { CREATE_PURCHASE_REQUISITION_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "purchase_requisitions",
    title: "Purchase Requisitions",
    description:
        "Pre-PO approval workflow — request, justify, and approve purchases before PO issuance",
    icon: AlertTriangle,
    createConfig: CREATE_PURCHASE_REQUISITION_CONFIG,
    searchKeys: ["title", "number"],
    columns: [
        { id: "id", header: "Number", accessorKey: "id" },
        { id: "number", header: "Title", accessorKey: "number" },
        { id: "title", header: "Urgency", accessorKey: "title" },
        {
            id: "justification",
            header: "Est. Cost",
            accessorKey: "justification",
            fieldType: "currency",
        },
        { id: "urgency", header: "Status", accessorKey: "urgency", fieldType: "status" },
        { id: "status", header: "Needed By", accessorKey: "status" },
        { id: "needed_by", header: "Items", accessorKey: "needed_by" },
    ],
};

export default function PurchaseRequisitionsPage() {
    const { data: rawData, isLoading } = usePurchaseRequisitions();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
