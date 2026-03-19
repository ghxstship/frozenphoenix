import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CONTRACT_AMENDMENTS_PAGE } from "@/config/list-page-configs";

export default async function ContractAmendmentsPage() {
    const data = await fetchEntityList("contract_amendment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CONTRACT_AMENDMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
