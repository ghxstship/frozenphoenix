import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { DealDetailClient } from "./_client";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("deals", id);
    return <DealDetailClient id={id} initialRecord={initialRecord} />;
}
