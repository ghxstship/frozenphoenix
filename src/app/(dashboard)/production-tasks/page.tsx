import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProductionTasksPage() {
    const data = await fetchEntityList("production_task");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_TASKS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
