import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { EventDetailClient } from "./_client";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("events", id);
    return <EventDetailClient id={id} initialRecord={initialRecord} />;
}
