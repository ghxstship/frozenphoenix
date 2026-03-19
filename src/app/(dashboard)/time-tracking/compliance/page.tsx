import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TimeTrackingCompliancePageClient } from "./_client";

export default async function TimeTrackingCompliancePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <TimeTrackingCompliancePageClient />
        </Suspense>
    );
}
