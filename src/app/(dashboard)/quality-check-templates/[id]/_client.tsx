"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ClipboardList } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "quality_check_template",
    titleKey: "name",
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/quality-check-templates",
    backLabel: "Quality Check Templates",
    chatterRecordType: "quality_check_template",
    fields: [],
    tabs: [],
};

export function QualityCheckTemplatesDetailClient({
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
