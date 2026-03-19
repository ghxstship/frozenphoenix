import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function VendorCommunicationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="VENDOR_COMMUNICATIONS_PAGE" />
        </Suspense>
    );
}
