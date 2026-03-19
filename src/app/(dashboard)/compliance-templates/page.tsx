import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ComplianceTemplatesPage() {
    const data = await fetchEntityList("compliance_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="COMPLIANCE_TEMPLATES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
