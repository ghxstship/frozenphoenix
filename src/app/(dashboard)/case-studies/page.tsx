import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CASE_STUDIES_PAGE } from "@/config/list-page-configs";

export default async function CaseStudiesPage() {
    const data = await fetchEntityList("case_study");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CASE_STUDIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
