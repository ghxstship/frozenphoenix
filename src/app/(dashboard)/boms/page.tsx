import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BOMS_PAGE } from "@/config/list-page-configs";

export default async function BomsPage() {
    const data = await fetchEntityList("bom");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BOMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
