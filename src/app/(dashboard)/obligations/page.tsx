import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CONTRACT_OBLIGATIONS_PAGE } from "@/config/list-page-configs";

export default async function ObligationsPage() {
    const data = await fetchEntityList("contract_obligation");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CONTRACT_OBLIGATIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
