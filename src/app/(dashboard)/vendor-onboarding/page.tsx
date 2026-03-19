import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function VendorOnboardingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="VENDOR_ONBOARDING_PAGE" />
        </Suspense>
    );
}
