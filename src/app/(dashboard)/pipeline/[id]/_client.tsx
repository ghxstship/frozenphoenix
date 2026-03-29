"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { GitBranch } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "pipeline",
    titleKey: "name",
    statusKey: "status",
    icon: GitBranch,
    backHref: "/pipeline",
    backLabel: "Pipeline",
    chatterRecordType: "pipeline",
    fields: [],
    relatedEntities: [
        {
            title: "Deals",
            entityKey: "deal",
            foreignKey: "pipeline_id",
            columns: [
                { id: "name", header: "Deal", accessorKey: "name" },
                { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
                { id: "stage", header: "Stage", accessorKey: "stage", fieldType: "status" },
                {
                    id: "expected_close",
                    header: "Close Date",
                    accessorKey: "expected_close",
                    fieldType: "date",
                },
            ],
            linkPattern: "/deals/{id}",
        },
    ],
    tabs: [],
};

export function PipelineDetailClient({
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
