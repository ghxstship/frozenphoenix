import { PurchaseOrderDetailClient } from "./_client";

export default async function PurchaseOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PurchaseOrderDetailClient id={id} initialRecord={null} />;
}
