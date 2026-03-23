"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { TrendingUp } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "revenue_recognition_entry",
    titleKey: "name",
    statusKey: "status",
    icon: TrendingUp,
    backHref: "/revenue",
    backLabel: "Revenue",
    chatterRecordType: "revenue_recognition_entry",
    fields: [],
    tabs: [],
};

export function RevenueDetailClient({
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
