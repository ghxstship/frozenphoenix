"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Wrench } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "engineering_approval",
    titleKey: "name",
    statusKey: "status",
    icon: Wrench,
    backHref: "/engineering-approvals",
    backLabel: "Engineering Approvals",
    chatterRecordType: "engineering_approval",
    fields: [],
    tabs: [],
};

export function EngineeringApprovalsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
