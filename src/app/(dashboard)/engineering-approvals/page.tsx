import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ENGINEERING_APPROVALS_PAGE } from "@/config/list-page-configs";

export default async function EngineeringApprovalsPage() {
    const data = await fetchEntityList("engineering_approval");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ENGINEERING_APPROVALS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
