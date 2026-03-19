import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SystemHealthPageClient } from "./_client";

export default async function SystemHealthPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SystemHealthPageClient />
        </Suspense>
    );
}
