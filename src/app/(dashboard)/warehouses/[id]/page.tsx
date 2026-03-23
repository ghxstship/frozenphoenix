import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { WarehousesDetailClient } from "./_client";

export default async function WarehousesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("warehouses", id);
    return <WarehousesDetailClient id={id} initialRecord={initialRecord} />;
}
