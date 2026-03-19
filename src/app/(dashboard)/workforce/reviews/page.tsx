import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ReviewsPageClient } from "./_client";

export default async function ReviewsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ReviewsPageClient />
        </Suspense>
    );
}
