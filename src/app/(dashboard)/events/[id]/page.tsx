import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { EventDetailClient } from "./_client";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("event", id);
    return <EventDetailClient id={id} initialRecord={record} />;
}
