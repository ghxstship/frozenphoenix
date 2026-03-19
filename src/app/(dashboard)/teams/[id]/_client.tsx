"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Users } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "team",
    titleKey: "name",
    statusKey: "status",
    icon: Users,
    backHref: "/teams",
    backLabel: "Teams",
    chatterRecordType: "team",
    fields: [],
    tabs: [],
};

export function TeamsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
