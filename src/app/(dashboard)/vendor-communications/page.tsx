import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { VENDOR_COMMUNICATIONS_PAGE } from "@/config/list-page-configs";

export default async function VendorCommunicationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VENDOR_COMMUNICATIONS_PAGE} />
        </Suspense>
    );
}
