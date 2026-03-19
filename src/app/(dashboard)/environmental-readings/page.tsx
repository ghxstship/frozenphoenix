import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function EnvironmentalReadingsPage() {
    const data = await fetchEntityList("environmental_reading");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ENVIRONMENTAL_READINGS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
