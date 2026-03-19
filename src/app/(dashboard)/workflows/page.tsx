import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkflowsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKFLOWS_PAGE" />
        </Suspense>
    );
}
