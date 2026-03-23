"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { BookOpen } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "case_study",
    titleKey: "title",
    statusKey: "status",
    icon: BookOpen,
    backHref: "/case-studies",
    backLabel: "Case Studies",
    chatterRecordType: "case_study",
    fields: [],
    tabs: [],
};

export function CaseStudiesDetailClient({
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
