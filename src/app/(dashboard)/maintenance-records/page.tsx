"use client";

import { ListPageShell } from "@/components/shells";
import { MAINTENANCE_RECORDS_PAGE } from "@/config/list-page-configs";

export default function MaintenanceRecordsPage() {
    return <ListPageShell config={MAINTENANCE_RECORDS_PAGE} />;
}
