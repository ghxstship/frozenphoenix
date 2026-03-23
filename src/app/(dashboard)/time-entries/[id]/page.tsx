import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TimeEntriesDetailClient } from "./_client";

export default async function TimeEntriesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("time_entries", id);
    return <TimeEntriesDetailClient id={id} initialRecord={initialRecord} />;
}
