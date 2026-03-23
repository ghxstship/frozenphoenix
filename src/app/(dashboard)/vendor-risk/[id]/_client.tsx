"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { AlertTriangle } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "risk_assessment",
    titleKey: "name",
    statusKey: "status",
    icon: AlertTriangle,
    backHref: "/vendor-risk",
    backLabel: "Vendor Risk",
    chatterRecordType: "risk_assessment",
    fields: [],
    tabs: [],
};

export function VendorRiskDetailClient({
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
