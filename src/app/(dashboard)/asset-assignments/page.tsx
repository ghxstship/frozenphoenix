import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ASSET_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default async function AssetAssignmentsPage() {
    const data = await fetchEntityList("asset_assignment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ASSET_ASSIGNMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
