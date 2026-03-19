import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { BriefDetailClient } from "./_client";

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("brief", id);
    return <BriefDetailClient id={id} initialRecord={record} />;
}
