import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { InventoryDetailClient } from "./_client";

export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("catalog_items", id);
    return <InventoryDetailClient id={id} initialRecord={initialRecord} />;
}
