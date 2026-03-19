import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { LeadDetailClient } from "./_client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("lead", id);
    return <LeadDetailClient id={id} initialRecord={record} />;
}
