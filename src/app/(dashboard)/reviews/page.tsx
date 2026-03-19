import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ReviewsPage() {
    const data = await fetchEntityList("review");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="REVIEWS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
