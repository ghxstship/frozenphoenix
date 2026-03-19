import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { VendorPortalPageClient } from "./_client";

export default async function VendorPortalPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <VendorPortalPageClient />
        </Suspense>
    );
}
