import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AiReportsPageClient } from "./_client";

export default async function AiReportsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AiReportsPageClient />
        </Suspense>
    );
}
