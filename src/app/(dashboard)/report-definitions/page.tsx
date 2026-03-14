"use client";

import { ListPageShell } from "@/components/shells";
import { REPORT_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default function ReportDefinitionsPage() {
    return <ListPageShell config={REPORT_DEFINITIONS_PAGE} />;
}
