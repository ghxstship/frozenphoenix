import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ShipmentDetailClient } from "./_client";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("shipment", id);
    return <ShipmentDetailClient id={id} initialRecord={record} />;
}
