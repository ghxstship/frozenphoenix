import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { IncidentDetailClient } from "./_client";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("incidents", id);
    return <IncidentDetailClient id={id} initialRecord={initialRecord} />;
}
