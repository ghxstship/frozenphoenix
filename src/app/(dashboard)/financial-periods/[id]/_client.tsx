"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CalendarRange } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "financial_period",
    titleKey: "name",
    statusKey: "status",
    icon: CalendarRange,
    backHref: "/financial-periods",
    backLabel: "Financial Periods",
    chatterRecordType: "financial_period",
    fields: [],
    tabs: [],
};

export function FinancialPeriodsDetailClient({
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
