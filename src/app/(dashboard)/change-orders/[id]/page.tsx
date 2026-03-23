import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ChangeOrderDetailClient } from "./_client";

export default async function ChangeOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("change-orders", id);
    return <ChangeOrderDetailClient id={id} initialRecord={initialRecord} />;
}
