import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SAVED_VIEWS_PAGE } from "@/config/list-page-configs";

export default async function SavedViewsPage() {
    const data = await fetchEntityList("saved_view");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SAVED_VIEWS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
