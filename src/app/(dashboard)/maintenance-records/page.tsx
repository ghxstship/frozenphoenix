"use client";

import { ListPageShell } from "@/components/shells";
import { MAINTENANCE_RECORDS_PAGE } from "@/config/list-page-configs";
import { useUpdateMaintenanceRecord } from "@/lib/supabase/hooks-assets-inventory";

export default function MaintenanceRecordsPage() {
    const _update = useUpdateMaintenanceRecord();
    return <ListPageShell config={MAINTENANCE_RECORDS_PAGE} />;
}
