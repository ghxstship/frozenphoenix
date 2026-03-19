import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CommChannelsPage() {
    const data = await fetchEntityList("comm_channel");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="COMM_CHANNELS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
