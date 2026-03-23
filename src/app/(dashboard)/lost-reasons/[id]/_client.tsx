"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { XCircle } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "lost_reason",
    titleKey: "name",
    statusKey: "status",
    icon: XCircle,
    backHref: "/lost-reasons",
    backLabel: "Lost Reasons",
    chatterRecordType: "lost_reason",
    fields: [],
    tabs: [],
};

export function LostReasonsDetailClient({
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
