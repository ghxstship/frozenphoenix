import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { LiveOpsPageClient } from "./_client";

export default async function LiveOpsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LiveOpsPageClient />
        </Suspense>
    );
}
