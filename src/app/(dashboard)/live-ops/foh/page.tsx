import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { FohPageClient } from "./_client";

export default async function FohPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <FohPageClient />
        </Suspense>
    );
}
