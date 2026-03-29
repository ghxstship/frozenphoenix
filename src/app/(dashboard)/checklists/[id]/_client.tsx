"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ClipboardCheck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "checklist",
    titleKey: "name",
    statusKey: "status",
    icon: ClipboardCheck,
    backHref: "/checklists",
    backLabel: "Checklists",
    chatterRecordType: "checklist",
    fields: [],
    relatedEntities: [
        {
            title: "Items",
            entityKey: "checklist_item",
            foreignKey: "checklist_id",
            columns: [
                { id: "title", header: "Item", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                { id: "assigned_to", header: "Assigned To", accessorKey: "assigned_to" },
            ],
        },
    ],
    tabs: [],
};

export function ChecklistsDetailClient({
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
