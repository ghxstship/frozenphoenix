import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { COMPLIANCE_CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default async function ComplianceChecklistsPage() {
    const data = await fetchEntityList("compliance_checklist");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={COMPLIANCE_CHECKLISTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
