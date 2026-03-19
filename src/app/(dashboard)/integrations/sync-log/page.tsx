import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SyncLogPageClient } from "./_client";

export default async function SyncLogPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SyncLogPageClient />
        </Suspense>
    );
}
