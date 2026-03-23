"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Zap } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "upsell_trigger",
    titleKey: "name",
    statusKey: "status",
    icon: Zap,
    backHref: "/upsell-triggers",
    backLabel: "Upsell Triggers",
    chatterRecordType: "upsell_trigger",
    fields: [],
    tabs: [],
};

export function UpsellTriggersDetailClient({
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
