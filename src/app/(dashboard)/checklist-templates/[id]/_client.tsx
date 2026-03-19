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

export function ChecklistTemplatesDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
