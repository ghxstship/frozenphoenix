import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ShipmentDetailClient } from "./_client";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("shipments", id);
    return <ShipmentDetailClient id={id} initialRecord={initialRecord} />;
}
