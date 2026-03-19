import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { MAINTENANCE_RECORDS_PAGE } from "@/config/list-page-configs";

export default async function MaintenanceRecordsPage() {
    const data = await fetchEntityList("maintenance_record");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={MAINTENANCE_RECORDS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
