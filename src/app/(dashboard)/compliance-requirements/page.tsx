import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { COMPLIANCE_REQUIREMENTS_PAGE } from "@/config/list-page-configs";

export default async function ComplianceRequirementsPage() {
    const data = await fetchEntityList("compliance_requirement");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={COMPLIANCE_REQUIREMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
