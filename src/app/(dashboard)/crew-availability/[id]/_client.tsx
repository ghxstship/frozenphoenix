"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CalendarDays } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "crew_availability",
    titleKey: "name",
    statusKey: "status",
    icon: CalendarDays,
    backHref: "/crew-availability",
    backLabel: "Crew Availability",
    chatterRecordType: "crew_availability",
    fields: [],
    tabs: [],
};

export function CrewAvailabilityDetailClient({
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
