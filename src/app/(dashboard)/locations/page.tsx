import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LOCATIONS_PAGE } from "@/config/list-page-configs";

export default async function LocationsPage() {
    const data = await fetchEntityList("location");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LOCATIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
