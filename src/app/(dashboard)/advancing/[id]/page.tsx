import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AdvancingOrderDetailPageClient } from "./_client";

export default async function AdvancingOrderDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AdvancingOrderDetailPageClient />
        </Suspense>
    );
}
