import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { LiveOpsCredentialsPageClient } from "./_client";

export default async function LiveOpsCredentialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LiveOpsCredentialsPageClient />
        </Suspense>
    );
}
