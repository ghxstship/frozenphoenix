import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { RunOfShowPageClient } from "./_client";

export default async function RunOfShowPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <RunOfShowPageClient />
        </Suspense>
    );
}
