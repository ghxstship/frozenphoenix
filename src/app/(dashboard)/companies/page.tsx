import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CompaniesPage() {
    const data = await fetchEntityList("company");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="COMPANIES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
