"use client";

import { ListPageShell } from "@/components/shells";
import { usePurchaseOrders } from "@/lib/supabase/hooks-pages";
import { CREATE_PURCHASE_ORDER_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "purchase_orders",
    title: "Purchase Orders",
    description: "Track vendor purchase orders from draft through receipt and invoice matching",
    icon: CheckCircle2,
    createConfig: CREATE_PURCHASE_ORDER_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function PurchaseOrdersPage() {
    const { data: rawData, isLoading } = usePurchaseOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
