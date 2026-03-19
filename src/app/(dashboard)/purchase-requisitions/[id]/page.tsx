import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { PurchaseRequisitionDetailClient } from "./_client";

export default async function PurchaseRequisitionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("purchase_requisition", id);
    return <PurchaseRequisitionDetailClient id={id} initialRecord={record} />;
}
