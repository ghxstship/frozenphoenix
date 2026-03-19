"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Target } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "resilience_target",
    titleKey: "name",
    statusKey: "status",
    icon: Target,
    backHref: "/resilience-targets",
    backLabel: "Resilience Targets",
    chatterRecordType: "resilience_target",
    fields: [],
    tabs: [],
};

export function ResilienceTargetsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
