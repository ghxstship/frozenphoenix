import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SOPS_PAGE } from "@/config/list-page-configs";

export default async function SOPsPage() {
    const data = await fetchEntityList("sop");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SOPS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
