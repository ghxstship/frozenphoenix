import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { WorkOrderDetailClient } from "./_client";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("work-orders", id);
    return <WorkOrderDetailClient id={id} initialRecord={initialRecord} />;
}
