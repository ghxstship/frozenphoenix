import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { REVIEWS_PAGE } from "@/config/list-page-configs";

export default async function ReviewsPage() {
    const data = await fetchEntityList("review");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={REVIEWS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
