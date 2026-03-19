import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DigitalAssetsPage() {
    const data = await fetchEntityList("digital_asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DIGITAL_ASSETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
