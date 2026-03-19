import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ProcurementPageClient } from "./_client";

export default async function ProcurementPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ProcurementPageClient />
        </Suspense>
    );
}
