import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ResourcePlannerPageClient } from "./_client";

export default async function ResourcePlannerPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ResourcePlannerPageClient />
        </Suspense>
    );
}
