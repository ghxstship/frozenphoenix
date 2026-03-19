import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LEADS_PAGE } from "@/config/list-page-configs";

export default async function LeadsPage() {
    const data = await fetchEntityList("lead");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LEADS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
