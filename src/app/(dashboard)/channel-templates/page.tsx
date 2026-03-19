import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CHANNEL_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function ChannelTemplatesPage() {
    const data = await fetchEntityList("channel_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CHANNEL_TEMPLATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
