import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewAssetPageClient } from "./_client";

export default async function NewAssetPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewAssetPageClient />
        </Suspense>
    );
}
