import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { COMMAND_POSITIONS_PAGE } from "@/config/list-page-configs";

export default async function CommandPositionsPage() {
    const data = await fetchEntityList("command_position");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={COMMAND_POSITIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
