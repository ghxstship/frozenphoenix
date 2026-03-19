import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ActivityLogPage() {
    const data = await fetchEntityList("activity_log");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ACTIVITY_LOG_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
