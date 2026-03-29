"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ClipboardCheck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "quality_check",
    titleKey: "name",
    statusKey: "status",
    icon: ClipboardCheck,
    backHref: "/quality-checks",
    backLabel: "Quality Checks",
    chatterRecordType: "quality_check",
    fields: [],
    relatedEntities: [
        {
            title: "Check Items",
            entityKey: "quality_check_item",
            foreignKey: "quality_check_id",
            columns: [
                { id: "name", header: "Check Point", accessorKey: "name" },
                { id: "result", header: "Result", accessorKey: "result", fieldType: "status" },
                { id: "notes", header: "Notes", accessorKey: "notes" },
            ],
        },
    ],
    tabs: [],
};

export function QualityChecksDetailClient({
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
