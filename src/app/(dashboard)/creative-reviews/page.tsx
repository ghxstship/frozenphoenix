import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CreativeReviewsPage() {
    const data = await fetchEntityList("creative_review");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREATIVE_REVIEWS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
