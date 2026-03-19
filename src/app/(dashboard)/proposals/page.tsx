import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProposalsPage() {
    const data = await fetchEntityList("proposal");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PROPOSALS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
