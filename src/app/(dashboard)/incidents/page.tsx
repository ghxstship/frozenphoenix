import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INCIDENTS_PAGE } from "@/config/list-page-configs";

export default async function IncidentsPage() {
    const data = await fetchEntityList("incident");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INCIDENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
