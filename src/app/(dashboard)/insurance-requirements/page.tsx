import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INSURANCE_REQUIREMENTS_PAGE } from "@/config/list-page-configs";

export default async function InsuranceRequirementsPage() {
    const data = await fetchEntityList("insurance_requirement");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INSURANCE_REQUIREMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
