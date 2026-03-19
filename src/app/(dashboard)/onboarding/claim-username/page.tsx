import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ClaimUsernamePageClient } from "./_client";

export default async function ClaimUsernamePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ClaimUsernamePageClient />
        </Suspense>
    );
}
