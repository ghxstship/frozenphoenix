import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CommsPageClient } from "./_client";

export default async function CommsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CommsPageClient />
        </Suspense>
    );
}
