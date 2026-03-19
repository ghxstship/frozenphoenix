import { PurchaseRequisitionDetailClient } from "./_client";

export default async function PurchaseRequisitionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PurchaseRequisitionDetailClient id={id} initialRecord={null} />;
}
