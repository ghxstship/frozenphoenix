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
    tabs: [],
};

export function UpsellEventsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
