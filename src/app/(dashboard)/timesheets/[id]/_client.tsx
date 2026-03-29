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
    relatedEntities: [
        {
            title: "Time Entries",
            entityKey: "time_entry",
            foreignKey: "timesheet_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "hours", header: "Hours", accessorKey: "hours", fieldType: "number" },
                { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/time-entries/{id}",
        },
    ],
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
