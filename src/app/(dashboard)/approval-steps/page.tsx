import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { APPROVAL_STEPS_PAGE } from "@/config/list-page-configs";

export default async function ApprovalStepsPage() {
    const data = await fetchEntityList("approval_step");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={APPROVAL_STEPS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
