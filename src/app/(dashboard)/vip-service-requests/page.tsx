import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { VIP_SERVICE_REQUESTS_PAGE } from "@/config/list-page-configs";

export default async function VipServiceRequestsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VIP_SERVICE_REQUESTS_PAGE} />
        </Suspense>
    );
}
