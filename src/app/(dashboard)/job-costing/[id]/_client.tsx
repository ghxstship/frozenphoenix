"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Calculator } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "job_cost_entry",
    titleKey: "name",
    statusKey: "status",
    icon: Calculator,
    backHref: "/job-costing",
    backLabel: "Job Costing",
    chatterRecordType: "job_cost_entry",
    fields: [],
    tabs: [],
};

export function JobCostingDetailClient({
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
