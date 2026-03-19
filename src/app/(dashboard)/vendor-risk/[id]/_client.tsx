"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { AlertTriangle } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "vendor_risk",
    titleKey: "name",
    statusKey: "status",
    icon: AlertTriangle,
    backHref: "/vendor-risk",
    backLabel: "Vendor Risk",
    chatterRecordType: "vendor_risk",
    fields: [],
    tabs: [],
};

export function VendorRiskDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
