"use client";

import { ListPageShell } from "@/components/shells";
import { useGoodsReceipts } from "@/lib/supabase/hooks-pages";
import { CREATE_GOODS_RECEIPT_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "goods_receipts",
    title: "Goods Receipts",
    description: "Delivery confirmation for 3-way matching — PO + goods receipt + vendor invoice",
    icon: AlertTriangle,
    createConfig: CREATE_GOODS_RECEIPT_CONFIG,
    searchKeys: ["receipt_number"],
    columns: [
        { id: "id", header: "Receipt #", accessorKey: "id" },
        { id: "receipt_number", header: "PO", accessorKey: "receipt_number" },
        { id: "purchase_order_id", header: "Location", accessorKey: "purchase_order_id" },
        {
            id: "delivery_location",
            header: "Status",
            accessorKey: "delivery_location",
            fieldType: "status",
        },
        { id: "status", header: "Received", accessorKey: "status" },
        { id: "discrepancies", header: "Items", accessorKey: "discrepancies" },
        { id: "discrepancies", header: "Discrepancies", accessorKey: "discrepancies" },
    ],
};

export default function GoodsReceiptsPage() {
    const { data: rawData, isLoading } = useGoodsReceipts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
