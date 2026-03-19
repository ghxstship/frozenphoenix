import { ShipmentDetailClient } from "./_client";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ShipmentDetailClient id={id} initialRecord={null} />;
}
