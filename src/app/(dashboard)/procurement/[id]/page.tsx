import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ProcurementDetailClient } from "./_client";

export default async function ProcurementDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("purchase_requisitions", id);
    return <ProcurementDetailClient id={id} initialRecord={initialRecord} />;
}
