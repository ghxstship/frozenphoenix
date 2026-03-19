import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { FulfillmentPageClient } from "./_client";

export default async function FulfillmentPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <FulfillmentPageClient />
        </Suspense>
    );
}
