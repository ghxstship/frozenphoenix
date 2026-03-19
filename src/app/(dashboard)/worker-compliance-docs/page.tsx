import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkerComplianceDocsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKER_COMPLIANCE_DOCS_PAGE" />
        </Suspense>
    );
}
