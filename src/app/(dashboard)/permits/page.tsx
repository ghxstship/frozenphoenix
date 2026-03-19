import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PERMITS_PAGE } from "@/config/list-page-configs";

export default async function PermitsPage() {
    const data = await fetchEntityList("permit");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PERMITS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
