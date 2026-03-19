import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ReconciliationPageClient } from "./_client";

export default async function ReconciliationPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ReconciliationPageClient />
        </Suspense>
    );
}
