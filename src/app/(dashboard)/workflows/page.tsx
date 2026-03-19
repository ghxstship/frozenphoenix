import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKFLOWS_PAGE } from "@/config/list-page-configs";

export default async function WorkflowsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKFLOWS_PAGE} />
        </Suspense>
    );
}
