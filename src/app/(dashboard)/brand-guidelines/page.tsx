import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BrandGuidelinesPage() {
    const data = await fetchEntityList("brand_guideline");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="BRANDS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
