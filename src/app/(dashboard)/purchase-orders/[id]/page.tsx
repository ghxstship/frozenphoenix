import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { PurchaseOrderDetailClient } from "./_client";

export default async function PurchaseOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("purchase_order", id);
    return <PurchaseOrderDetailClient id={id} initialRecord={record} />;
}
