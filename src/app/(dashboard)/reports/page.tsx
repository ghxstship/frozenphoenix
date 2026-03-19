import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ReportsPageClient } from "./_client";

export default async function ReportsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ReportsPageClient />
        </Suspense>
    );
}
