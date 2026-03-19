import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { OpportunityDetailClient } from "./_client";

export default async function OpportunityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("opportunity", id);
    return <OpportunityDetailClient id={id} initialRecord={record} />;
}
