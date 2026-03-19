import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LostReasonsPage() {
    const data = await fetchEntityList("lost_reason");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="LOST_REASONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
