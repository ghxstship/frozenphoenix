import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LocationsPage() {
    const data = await fetchEntityList("location");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="LOCATIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
