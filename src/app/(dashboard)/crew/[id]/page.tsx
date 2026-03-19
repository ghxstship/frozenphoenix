import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CrewDetailClient } from "./_client";

export default async function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("crew_member", id);
    return <CrewDetailClient id={id} initialRecord={record} />;
}
