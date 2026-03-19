import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { VENDOR_REVIEWS_PAGE } from "@/config/list-page-configs";

export default async function VendorReviewsPage() {
    const data = await fetchEntityList("vendor_review");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VENDOR_REVIEWS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
