import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AccessReviewsPageClient } from "./_client";

export default async function AccessReviewsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AccessReviewsPageClient />
        </Suspense>
    );
}
