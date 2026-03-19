import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AssetScannerPageClient } from "./_client";

export default async function AssetScannerPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AssetScannerPageClient />
        </Suspense>
    );
}
