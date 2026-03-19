import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { RevenueRecognitionPageClient } from "./_client";

export default async function RevenueRecognitionPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <RevenueRecognitionPageClient />
        </Suspense>
    );
}
