"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Boxes } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "catalog_item",
    titleKey: "name",
    statusKey: "status",
    icon: Boxes,
    backHref: "/inventory",
    backLabel: "Inventory",
    chatterRecordType: "catalog_item",
    fields: [],
    relatedEntities: [
        {
            title: "Purchase Orders",
            entityKey: "purchase_order",
            foreignKey: "catalog_item_id",
            columns: [
                { id: "po_number", header: "PO #", accessorKey: "po_number" },
                {
                    id: "total_amount",
                    header: "Total",
                    accessorKey: "total_amount",
                    fieldType: "currency",
                },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/purchase-orders/{id}",
        },
    ],
    tabs: [],
};

export function InventoryDetailClient({
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
