import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { GateScannerPageClient } from "./_client";

export default async function GateScannerPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <GateScannerPageClient />
        </Suspense>
    );
}
