import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { VendorsPageClient } from "./_client";

export default async function VendorsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <VendorsPageClient />
        </Suspense>
    );
}
