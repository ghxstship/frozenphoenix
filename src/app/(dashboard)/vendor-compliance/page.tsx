import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { VendorCompliancePageClient } from "./_client";

export default async function VendorCompliancePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <VendorCompliancePageClient />
        </Suspense>
    );
}
