import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { IncidentDetailClient } from "./_client";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("incident", id);
    return <IncidentDetailClient id={id} initialRecord={record} />;
}
