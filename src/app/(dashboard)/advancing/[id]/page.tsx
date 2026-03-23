import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { AdvancingOrderDetailPageClient } from "./_client";

export default async function AdvancingOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("production_advances", id);
    return <AdvancingOrderDetailPageClient id={id} initialRecord={initialRecord} />;
}
