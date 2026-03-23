"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Clock } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "time_entry",
    titleKey: "name",
    statusKey: "status",
    icon: Clock,
    backHref: "/time-entries",
    backLabel: "Time Entries",
    chatterRecordType: "time_entry",
    fields: [],
    tabs: [],
};

export function TimeEntriesDetailClient({
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
