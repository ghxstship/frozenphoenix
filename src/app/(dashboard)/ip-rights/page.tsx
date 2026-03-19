import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { IP_RIGHTS_PAGE } from "@/config/list-page-configs";

export default async function IpRightsPage() {
    const data = await fetchEntityList("ip_right");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={IP_RIGHTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
