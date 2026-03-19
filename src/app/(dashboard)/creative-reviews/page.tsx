import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREATIVE_REVIEWS_PAGE } from "@/config/list-page-configs";

export default async function CreativeReviewsPage() {
    const data = await fetchEntityList("creative_review");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREATIVE_REVIEWS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
