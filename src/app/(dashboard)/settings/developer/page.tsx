import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DeveloperPortalPageClient } from "./_client";

export default async function DeveloperPortalPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DeveloperPortalPageClient />
        </Suspense>
    );
}
