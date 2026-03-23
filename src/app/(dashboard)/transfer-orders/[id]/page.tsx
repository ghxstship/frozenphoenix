import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TransferOrdersDetailClient } from "./_client";

export default async function TransferOrdersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("transfer_orders", id);
    return <TransferOrdersDetailClient id={id} initialRecord={initialRecord} />;
}
