"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileBarChart } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "report_definition",
    titleKey: "name",
    statusKey: "status",
    icon: FileBarChart,
    backHref: "/report-definitions",
    backLabel: "Report Definitions",
    chatterRecordType: "report_definition",
    fields: [],
    tabs: [],
};

export function ReportDefinitionsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
