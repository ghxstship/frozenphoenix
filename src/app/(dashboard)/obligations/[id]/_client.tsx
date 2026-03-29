"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileWarning } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "contract_obligation",
    titleKey: "title",
    statusKey: "status",
    icon: FileWarning,
    backHref: "/obligations",
    backLabel: "Obligations",
    chatterRecordType: "contract_obligation",
    fields: [],
    relatedEntities: [
        {
            title: "Requirements",
            entityKey: "obligation_requirement",
            foreignKey: "contract_obligation_id",
            columns: [
                { id: "title", header: "Requirement", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
            ],
        },
    ],
    tabs: [],
};

export function ObligationsDetailClient({
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
