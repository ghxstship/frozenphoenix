import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ACTIVITY_LOG_PAGE } from "@/config/list-page-configs";

export default async function ActivityLogPage() {
    const data = await fetchEntityList("activity_log");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ACTIVITY_LOG_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
