import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CatalogPageClient } from "./_client";

export default async function CatalogPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CatalogPageClient />
        </Suspense>
    );
}
