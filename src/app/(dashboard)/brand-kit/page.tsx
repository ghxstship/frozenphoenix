import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BrandKitPage() {
    const data = await fetchEntityList("brand_kit");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="BRAND_KITS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
