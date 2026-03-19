import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ENVIRONMENTAL_READINGS_PAGE } from "@/config/list-page-configs";

export default async function EnvironmentalReadingsPage() {
    const data = await fetchEntityList("environmental_reading");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ENVIRONMENTAL_READINGS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
