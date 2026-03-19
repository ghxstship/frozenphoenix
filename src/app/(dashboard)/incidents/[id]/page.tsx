import { IncidentDetailClient } from "./_client";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <IncidentDetailClient id={id} initialRecord={null} />;
}
