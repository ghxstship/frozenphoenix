"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Users } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "stakeholder",
    titleKey: "name",
    statusKey: "status",
    icon: Users,
    backHref: "/stakeholders",
    backLabel: "Stakeholders",
    chatterRecordType: "stakeholder",
    fields: [],
    tabs: [],
};

export function StakeholdersDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
