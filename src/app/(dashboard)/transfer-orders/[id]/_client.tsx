"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ArrowRightLeft } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "transfer_order",
    titleKey: "name",
    statusKey: "status",
    icon: ArrowRightLeft,
    backHref: "/transfer-orders",
    backLabel: "Transfer Orders",
    chatterRecordType: "transfer_order",
    fields: [],
    relatedEntities: [
        {
            title: "Items",
            entityKey: "transfer_order_item",
            foreignKey: "transfer_order_id",
            columns: [
                { id: "item_name", header: "Item", accessorKey: "item_name" },
                { id: "quantity", header: "Qty", accessorKey: "quantity", fieldType: "number" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
        },
    ],
    tabs: [],
};

export function TransferOrdersDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
