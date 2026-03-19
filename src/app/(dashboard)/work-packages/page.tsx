import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { WORK_PACKAGES_PAGE } from "@/config/list-page-configs";

export default async function WorkPackagesPage() {
    const data = await fetchEntityList("work_package");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORK_PACKAGES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
