import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BrandGuidelineSectionsPage() {
    const data = await fetchEntityList("brand_guideline_section");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell
                configKey="BRAND_GUIDELINE_SECTIONS_PAGE"
                data={data}
                isLoading={false}
            />
        </Suspense>
    );
}
