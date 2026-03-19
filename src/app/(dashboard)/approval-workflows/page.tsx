import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { APPROVAL_WORKFLOWS_PAGE } from "@/config/list-page-configs";

export default async function ApprovalWorkflowsPage() {
    const data = await fetchEntityList("approval_workflow");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={APPROVAL_WORKFLOWS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
