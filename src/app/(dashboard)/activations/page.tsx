import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ActivationsPageClient } from "./_client";

export default async function ActivationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ActivationsPageClient />
        </Suspense>
    );
}
