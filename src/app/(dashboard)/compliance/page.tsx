import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ComplianceDashboardPageClient } from "./_client";

export default async function ComplianceDashboardPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ComplianceDashboardPageClient />
        </Suspense>
    );
}
