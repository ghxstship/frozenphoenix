import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CONTRACTS_PAGE } from "@/config/list-page-configs";

export default async function ContractsPage() {
    const data = await fetchEntityList("contract");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CONTRACTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
