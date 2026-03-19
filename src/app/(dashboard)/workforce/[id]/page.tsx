import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { WorkforceDetailClient } from "./_client";

export default async function WorkforceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("worker_profile", id);
    return <WorkforceDetailClient id={id} initialRecord={record} />;
}
