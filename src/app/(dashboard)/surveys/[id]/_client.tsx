"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ClipboardList } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "survey",
    titleKey: "title",
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/surveys",
    backLabel: "Surveys",
    chatterRecordType: "survey",
    fields: [],
    tabs: [],
};

export function SurveysDetailClient({
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
