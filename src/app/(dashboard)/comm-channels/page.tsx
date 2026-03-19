import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { COMM_CHANNELS_PAGE } from "@/config/list-page-configs";

export default async function CommChannelsPage() {
    const data = await fetchEntityList("comm_channel");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={COMM_CHANNELS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
