import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { EstimateDetailClient } from "./_client";

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("estimate", id);
    return <EstimateDetailClient id={id} initialRecord={record} />;
}
