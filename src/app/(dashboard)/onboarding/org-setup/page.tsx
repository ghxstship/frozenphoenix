import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { OrgSetupPageClient } from "./_client";

export default async function OrgSetupPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <OrgSetupPageClient />
        </Suspense>
    );
}
