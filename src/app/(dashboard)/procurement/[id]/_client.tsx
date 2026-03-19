"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ShoppingCart } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "purchase_requisition",
    titleKey: "name",
    statusKey: "status",
    icon: ShoppingCart,
    backHref: "/procurement",
    backLabel: "Procurement",
    chatterRecordType: "purchase_requisition",
    fields: [],
    tabs: [],
};

export function ProcurementDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
