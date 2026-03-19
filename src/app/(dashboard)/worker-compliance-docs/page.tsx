import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKER_COMPLIANCE_DOCS_PAGE } from "@/config/list-page-configs";

export default async function WorkerComplianceDocsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_COMPLIANCE_DOCS_PAGE} />
        </Suspense>
    );
}
