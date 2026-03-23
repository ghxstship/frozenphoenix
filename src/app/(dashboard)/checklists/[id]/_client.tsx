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
