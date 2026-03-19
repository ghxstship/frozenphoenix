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
    tabs: [],
};

export function GoodsReceiptsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
