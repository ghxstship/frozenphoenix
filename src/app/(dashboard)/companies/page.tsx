import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { COMPANIES_PAGE } from "@/config/list-page-configs";

export default async function CompaniesPage() {
    const data = await fetchEntityList("company");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={COMPANIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
