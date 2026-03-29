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
    relatedEntities: [
        {
            title: "Shifts",
            entityKey: "crew_shift",
            foreignKey: "crew_member_id",
            columns: [
                { id: "event_name", header: "Event", accessorKey: "event_name" },
                { id: "role", header: "Role", accessorKey: "role" },
                { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/shifts/{id}",
        },
    ],
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
