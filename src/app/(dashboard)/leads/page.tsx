import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LeadsPage() {
    const data = await fetchEntityList("lead");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="LEADS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
