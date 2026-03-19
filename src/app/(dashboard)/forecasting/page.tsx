import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ForecastingPageClient } from "./_client";

export default async function ForecastingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ForecastingPageClient />
        </Suspense>
    );
}
