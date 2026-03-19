import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CommandPositionsPage() {
    const data = await fetchEntityList("command_position");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="COMMAND_POSITIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
