import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INSURANCE_POLICIES_PAGE } from "@/config/list-page-configs";

export default async function InsurancePoliciesPage() {
    const data = await fetchEntityList("insurance_policy");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INSURANCE_POLICIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
