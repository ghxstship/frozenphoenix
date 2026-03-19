import { FleetDetailClient } from "./_client";

export default async function FleetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <FleetDetailClient id={id} initialRecord={null} />;
}
