import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { MarketplacePageClient } from "./_client";

export default async function MarketplacePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <MarketplacePageClient />
        </Suspense>
    );
}
