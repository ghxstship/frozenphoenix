"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { GitBranch } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "workflow",
    titleKey: "name",
    statusKey: "status",
    icon: GitBranch,
    backHref: "/workflows",
    backLabel: "Workflows",
    chatterRecordType: "workflow",
    fields: [],
    tabs: [],
};

export function WorkflowsDetailClient({
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
