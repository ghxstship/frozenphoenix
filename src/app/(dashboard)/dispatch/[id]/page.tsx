import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { DispatchDetailClient } from "./_client";

export default async function DispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("dispatch_entry", id);
    return <DispatchDetailClient id={id} initialRecord={record} />;
}
