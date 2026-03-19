import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function SavedViewsPage() {
    const data = await fetchEntityList("saved_view");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SAVED_VIEWS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
