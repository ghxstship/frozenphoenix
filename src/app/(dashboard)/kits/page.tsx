import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { KITS_PAGE } from "@/config/list-page-configs";

export default async function KitsPage() {
    const data = await fetchEntityList("kit");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={KITS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
