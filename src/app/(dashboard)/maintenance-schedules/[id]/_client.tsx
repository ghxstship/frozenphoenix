"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Wrench } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "maintenance_schedule",
    titleKey: "name",
    statusKey: "status",
    icon: Wrench,
    backHref: "/maintenance-schedules",
    backLabel: "Maintenance Schedules",
    chatterRecordType: "maintenance_schedule",
    fields: [],
    tabs: [],
};

export function MaintenanceSchedulesDetailClient({
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
