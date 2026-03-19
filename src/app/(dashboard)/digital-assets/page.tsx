import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DIGITAL_ASSETS_PAGE } from "@/config/list-page-configs";

export default async function DigitalAssetsPage() {
    const data = await fetchEntityList("digital_asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DIGITAL_ASSETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
