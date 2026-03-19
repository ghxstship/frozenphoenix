import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SCOPES_OF_WORK_PAGE } from "@/config/list-page-configs";

export default async function ScopesOfWorkPage() {
    const data = await fetchEntityList("sow");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SCOPES_OF_WORK_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
