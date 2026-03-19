import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { AUTOMATION_EXECUTIONS_PAGE } from "@/config/list-page-configs";

export default async function AutomationExecutionsPage() {
    const data = await fetchEntityList("automation_execution");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={AUTOMATION_EXECUTIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
