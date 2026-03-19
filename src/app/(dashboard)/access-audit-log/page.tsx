import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function AccessAuditLogPage() {
    const data = await fetchEntityList("access_audit_log");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ACCESS_AUDIT_LOG_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
