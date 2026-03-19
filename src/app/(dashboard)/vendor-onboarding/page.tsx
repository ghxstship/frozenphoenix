import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { VENDOR_ONBOARDING_PAGE } from "@/config/list-page-configs";

export default async function VendorOnboardingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VENDOR_ONBOARDING_PAGE} />
        </Suspense>
    );
}
