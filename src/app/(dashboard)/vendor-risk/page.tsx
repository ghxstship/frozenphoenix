import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { VENDOR_RISK_PAGE } from "@/config/list-page-configs";

export default async function VendorRiskPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VENDOR_RISK_PAGE} />
        </Suspense>
    );
}
