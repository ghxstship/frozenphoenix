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

export function ProcurementDetailClient({
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
