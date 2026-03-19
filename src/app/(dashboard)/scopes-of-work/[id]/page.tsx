import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ScopeOfWorkDetailPageClient } from "./_client";

export default async function ScopeOfWorkDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ScopeOfWorkDetailPageClient />
        </Suspense>
    );
}
