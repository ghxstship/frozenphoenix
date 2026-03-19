"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { History } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "advance_status_history",
    titleKey: "name",
    statusKey: "status",
    icon: History,
    backHref: "/advance-status-history",
    backLabel: "Advance Status History",
    chatterRecordType: "advance_status_history",
    fields: [],
    tabs: [],
};

export function AdvanceStatusHistoryDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
