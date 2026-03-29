"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Scale } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "clause_library_entry",
    titleKey: "title",
    statusKey: "status",
    icon: Scale,
    backHref: "/clause-library",
    backLabel: "Clause Library",
    chatterRecordType: "clause_library_entry",
    fields: [],
    relatedEntities: [
        {
            title: "Contracts Using This Clause",
            entityKey: "contract",
            foreignKey: "clause_library_entry_id",
            columns: [
                { id: "title", header: "Contract", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
            ],
            linkPattern: "/contracts/{id}",
        },
    ],
    tabs: [],
};

export function ClauseLibraryDetailClient({
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
