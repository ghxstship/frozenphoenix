import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ScopeOfWorkDetailPageClient } from "./_client";

export default async function ScopeOfWorkDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("scopes_of_work", id);
    return <ScopeOfWorkDetailPageClient id={id} initialRecord={initialRecord} />;
}
