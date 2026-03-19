import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ACCESS_AUDIT_LOG_PAGE } from "@/config/list-page-configs";

export default async function AccessAuditLogPage() {
    const data = await fetchEntityList("access_audit_log");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ACCESS_AUDIT_LOG_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
