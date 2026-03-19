import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function MaintenanceSchedulesPage() {
    const data = await fetchEntityList("maintenance_schedule");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="MAINTENANCE_SCHEDULES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
