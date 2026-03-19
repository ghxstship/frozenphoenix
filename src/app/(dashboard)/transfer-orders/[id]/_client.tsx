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
    tabs: [],
};

export function TransferOrdersDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
