import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function MaintenanceRecordsPage() {
    const data = await fetchEntityList("maintenance_record");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="MAINTENANCE_RECORDS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
