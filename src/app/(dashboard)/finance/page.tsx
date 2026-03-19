import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { FinancePageClient } from "./_client";

export default async function FinancePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <FinancePageClient />
        </Suspense>
    );
}
