import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LOST_REASONS_PAGE } from "@/config/list-page-configs";

export default async function LostReasonsPage() {
    const data = await fetchEntityList("lost_reason");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LOST_REASONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
