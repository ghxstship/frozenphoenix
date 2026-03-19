import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function WorkPackagesPage() {
    const data = await fetchEntityList("work_package");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORK_PACKAGES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
