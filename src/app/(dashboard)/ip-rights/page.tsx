import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function IpRightsPage() {
    const data = await fetchEntityList("ip_right");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="IP_RIGHTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
