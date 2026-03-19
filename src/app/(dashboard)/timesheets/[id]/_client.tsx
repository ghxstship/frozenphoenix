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

export function TimesheetsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
