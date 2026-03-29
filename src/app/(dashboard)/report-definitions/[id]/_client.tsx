"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileBarChart } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "report_definition",
    titleKey: "name",
    statusKey: "status",
    icon: FileBarChart,
    backHref: "/report-definitions",
    backLabel: "Report Definitions",
    chatterRecordType: "report_definition",
    fields: [],
    relatedEntities: [
        {
            title: "Parameters",
            entityKey: "report_parameter",
            foreignKey: "report_definition_id",
            columns: [
                { id: "name", header: "Parameter", accessorKey: "name" },
                { id: "type", header: "Type", accessorKey: "type" },
                { id: "default_value", header: "Default", accessorKey: "default_value" },
            ],
        },
    ],
    tabs: [],
};

export function ReportDefinitionsDetailClient({
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
