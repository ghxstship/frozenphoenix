"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Timer } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "sla_definition",
    titleKey: "name",
    statusKey: "status",
    icon: Timer,
    backHref: "/sla-definitions",
    backLabel: "Sla Definitions",
    chatterRecordType: "sla_definition",
    fields: [],
    relatedEntities: [
        {
            title: "Incidents",
            entityKey: "incident",
            foreignKey: "sla_definition_id",
            columns: [
                { id: "title", header: "Incident", accessorKey: "title" },
                {
                    id: "severity",
                    header: "Severity",
                    accessorKey: "severity",
                    fieldType: "status",
                },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/incidents/{id}",
        },
    ],
    tabs: [],
};

export function SlaDefinitionsDetailClient({
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
