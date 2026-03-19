import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ClauseLibraryPage() {
    const data = await fetchEntityList("clause_library_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CLAUSE_LIBRARY_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
