import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function PosTransactionsPage() {
    const data = await fetchEntityList("pos_transaction");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="POS_TRANSACTIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
