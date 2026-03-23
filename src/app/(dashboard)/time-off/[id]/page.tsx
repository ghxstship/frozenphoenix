import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TimeOffDetailClient } from "./_client";

export default async function TimeOffDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("time_off_requests", id);
    return <TimeOffDetailClient id={id} initialRecord={initialRecord} />;
}
