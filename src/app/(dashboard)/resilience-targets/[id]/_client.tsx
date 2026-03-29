"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Target } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "resilience_target",
    titleKey: "name",
    statusKey: "status",
    icon: Target,
    backHref: "/resilience-targets",
    backLabel: "Resilience Targets",
    chatterRecordType: "resilience_target",
    fields: [],
    relatedEntities: [
        {
            title: "Metrics",
            entityKey: "resilience_metric",
            foreignKey: "resilience_target_id",
            columns: [
                { id: "name", header: "Metric", accessorKey: "name" },
                {
                    id: "current_value",
                    header: "Current",
                    accessorKey: "current_value",
                    fieldType: "number",
                },
                {
                    id: "target_value",
                    header: "Target",
                    accessorKey: "target_value",
                    fieldType: "number",
                },
            ],
        },
    ],
    tabs: [],
};

export function ResilienceTargetsDetailClient({
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
