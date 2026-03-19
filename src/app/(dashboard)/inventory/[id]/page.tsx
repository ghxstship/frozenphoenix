import { InventoryDetailClient } from "./_client";

export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <InventoryDetailClient id={id} />;
}
