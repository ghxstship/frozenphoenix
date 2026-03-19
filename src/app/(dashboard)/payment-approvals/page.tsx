import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function PaymentApprovalsPage() {
    const data = await fetchEntityList("payment_approval");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PAYMENT_APPROVALS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
