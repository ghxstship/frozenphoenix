"use client";

import { ListPageShell } from "@/components/shells";
import { DATA_EXPORT_REQUESTS_PAGE } from "@/config/list-page-configs";

export default function DataExportRequestsPage() {
    return <ListPageShell config={DATA_EXPORT_REQUESTS_PAGE} />;
}
