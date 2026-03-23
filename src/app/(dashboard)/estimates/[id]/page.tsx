import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { EstimateDetailClient } from "./_client";

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("estimates", id);
    return <EstimateDetailClient id={id} initialRecord={initialRecord} />;
}
