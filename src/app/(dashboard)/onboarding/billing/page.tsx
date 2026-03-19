import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { BillingSetupPageClient } from "./_client";

export default async function BillingSetupPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <BillingSetupPageClient />
        </Suspense>
    );
}
