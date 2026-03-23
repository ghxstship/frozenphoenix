"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Clock } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "timesheet",
    titleKey: "name",
    statusKey: "status",
    icon: Clock,
    backHref: "/timesheets",
    backLabel: "Timesheets",
    chatterRecordType: "timesheet",
    fields: [],
    tabs: [],
};

export function TimesheetsDetailClient({
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
