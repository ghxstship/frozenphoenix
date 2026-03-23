import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { LiveOpsDetailClient } from "./_client";

export default async function LiveOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("live-ops", id);
    return <LiveOpsDetailClient id={id} initialRecord={initialRecord} />;
}
