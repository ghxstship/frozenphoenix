import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SurveysPageClient } from "./_client";

export default async function SurveysPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SurveysPageClient />
        </Suspense>
    );
}
