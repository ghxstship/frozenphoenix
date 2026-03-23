import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TimeOffRequestsDetailClient } from "./_client";

export default async function TimeOffRequestsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("time_off_requests", id);
    return <TimeOffRequestsDetailClient id={id} initialRecord={initialRecord} />;
}
