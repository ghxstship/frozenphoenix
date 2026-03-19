"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Timer } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "sla_definition",
    titleKey: "name",
    statusKey: "status",
    icon: Timer,
    backHref: "/sla-definitions",
    backLabel: "Sla Definitions",
    chatterRecordType: "sla_definition",
    fields: [],
    tabs: [],
};

export function SlaDefinitionsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
