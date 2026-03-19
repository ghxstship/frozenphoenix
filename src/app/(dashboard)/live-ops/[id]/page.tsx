import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { LiveOpsDetailClient } from "./_client";

export default async function LiveOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("live_event_instance", id);
    return <LiveOpsDetailClient id={id} initialRecord={record} />;
}
