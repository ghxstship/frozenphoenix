"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ClipboardList } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "checklist_template",
    titleKey: "name",
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/checklist-templates",
    backLabel: "Checklist Templates",
    chatterRecordType: "checklist_template",
    fields: [],
    tabs: [],
};

export function ChecklistTemplatesDetailClient({
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
