import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { AdvanceStatusHistoryDetailClient } from "./_client";

export default async function AdvanceStatusHistoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("advance_status_history", id);
    return <AdvanceStatusHistoryDetailClient id={id} initialRecord={initialRecord} />;
}
