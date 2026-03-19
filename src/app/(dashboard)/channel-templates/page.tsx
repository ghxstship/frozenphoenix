import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ChannelTemplatesPage() {
    const data = await fetchEntityList("channel_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CHANNEL_TEMPLATES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
