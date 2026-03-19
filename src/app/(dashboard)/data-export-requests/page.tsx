import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DATA_EXPORT_REQUESTS_PAGE } from "@/config/list-page-configs";

export default async function DataExportRequestsPage() {
    const data = await fetchEntityList("data_export_request");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DATA_EXPORT_REQUESTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
