import { WarehousesDetailClient } from "./_client";

export default async function WarehousesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <WarehousesDetailClient id={id} initialRecord={null} />;
}
