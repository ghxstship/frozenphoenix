import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewPipelinePageClient } from "./_client";

export default async function NewPipelinePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewPipelinePageClient />
        </Suspense>
    );
}
