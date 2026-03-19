"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { GitBranch } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "pipeline",
    titleKey: "name",
    statusKey: "status",
    icon: GitBranch,
    backHref: "/pipeline",
    backLabel: "Pipeline",
    chatterRecordType: "pipeline",
    fields: [],
    tabs: [],
};

export function PipelineDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
