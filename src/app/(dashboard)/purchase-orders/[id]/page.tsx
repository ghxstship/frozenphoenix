import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PurchaseOrderDetailClient } from "./_client";

export default async function PurchaseOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("purchase-orders", id);
    return <PurchaseOrderDetailClient id={id} initialRecord={initialRecord} />;
}
