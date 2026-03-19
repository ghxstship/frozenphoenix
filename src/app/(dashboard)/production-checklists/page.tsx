import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default async function ProductionChecklistsPage() {
    const data = await fetchEntityList("production_checklist");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_CHECKLISTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
