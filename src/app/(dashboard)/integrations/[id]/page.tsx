import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { IntegrationDetailPageClient } from "./_client";

export default async function IntegrationDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <IntegrationDetailPageClient />
        </Suspense>
    );
}
