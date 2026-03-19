import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { OnboardingPageClient } from "./_client";

export default async function OnboardingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <OnboardingPageClient />
        </Suspense>
    );
}
