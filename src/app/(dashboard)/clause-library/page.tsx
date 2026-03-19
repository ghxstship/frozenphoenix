import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CLAUSE_LIBRARY_PAGE } from "@/config/list-page-configs";

export default async function ClauseLibraryPage() {
    const data = await fetchEntityList("clause_library_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CLAUSE_LIBRARY_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
