import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { STAKEHOLDERS_PAGE } from "@/config/list-page-configs";

export default async function StakeholdersPage() {
    const data = await fetchEntityList("stakeholder");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={STAKEHOLDERS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
