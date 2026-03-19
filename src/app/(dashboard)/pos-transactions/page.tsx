import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { POS_TRANSACTIONS_PAGE } from "@/config/list-page-configs";

export default async function PosTransactionsPage() {
    const data = await fetchEntityList("pos_transaction");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={POS_TRANSACTIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
