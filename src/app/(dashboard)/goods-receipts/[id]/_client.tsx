"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { PackageCheck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "goods_receipt",
    titleKey: "name",
    statusKey: "status",
    icon: PackageCheck,
    backHref: "/goods-receipts",
    backLabel: "Goods Receipts",
    chatterRecordType: "goods_receipt",
    fields: [],
    relatedEntities: [
        {
            title: "Line Items",
            entityKey: "goods_receipt_line_item",
            foreignKey: "goods_receipt_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "quantity", header: "Qty", accessorKey: "quantity", fieldType: "number" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
        },
    ],
    tabs: [],
};

export function GoodsReceiptsDetailClient({
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
