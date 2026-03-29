"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { TrendingUp } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "upsell_event",
    titleKey: "name",
    statusKey: "status",
    icon: TrendingUp,
    backHref: "/upsell-events",
    backLabel: "Upsell Events",
    chatterRecordType: "upsell_event",
    fields: [],
    relatedEntities: [
        {
            title: "Triggers",
            entityKey: "upsell_trigger",
            foreignKey: "upsell_event_id",
            columns: [
                { id: "name", header: "Trigger", accessorKey: "name" },
                { id: "type", header: "Type", accessorKey: "type" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/upsell-triggers/{id}",
        },
    ],
    tabs: [],
};

export function UpsellEventsDetailClient({
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
