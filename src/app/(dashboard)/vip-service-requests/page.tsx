import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function VipServiceRequestsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="VIP_SERVICE_REQUESTS_PAGE" />
        </Suspense>
    );
}
