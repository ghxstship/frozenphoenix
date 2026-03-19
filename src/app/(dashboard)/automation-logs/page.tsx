import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function AutomationLogsPage() {
    const data = await fetchEntityList("automation_log");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="AUTOMATION_LOGS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
