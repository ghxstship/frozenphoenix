"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CalendarOff } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "time_off_request",
    titleKey: "name",
    statusKey: "status",
    icon: CalendarOff,
    backHref: "/time-off",
    backLabel: "Time Off",
    chatterRecordType: "time_off_request",
    fields: [],
    tabs: [],
};

export function TimeOffDetailClient({
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
