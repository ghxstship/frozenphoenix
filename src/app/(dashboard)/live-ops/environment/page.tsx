import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { EnvironmentPageClient } from "./_client";

export default async function EnvironmentPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <EnvironmentPageClient />
        </Suspense>
    );
}
