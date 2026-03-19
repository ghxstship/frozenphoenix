import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { BatchAssetScannerPageClient } from "./_client";

export default async function BatchAssetScannerPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <BatchAssetScannerPageClient />
        </Suspense>
    );
}
