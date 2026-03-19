import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default async function ChecklistsPage() {
    const data = await fetchEntityList("checklist");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CHECKLISTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
