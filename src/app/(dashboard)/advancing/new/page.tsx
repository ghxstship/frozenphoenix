import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewAdvancingOrderPageClient } from "./_client";

export default async function NewAdvancingOrderPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewAdvancingOrderPageClient />
        </Suspense>
    );
}
