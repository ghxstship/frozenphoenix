import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_TASKS_PAGE } from "@/config/list-page-configs";

export default async function ProductionTasksPage() {
    const data = await fetchEntityList("production_task");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_TASKS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
