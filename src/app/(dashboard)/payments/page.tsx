import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PAYMENTS_PAGE } from "@/config/list-page-configs";

export default async function PaymentsPage() {
    const data = await fetchEntityList("payment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PAYMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
