import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { DealDetailClient } from "./_client";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("deal", id);
    return <DealDetailClient id={id} initialRecord={record} />;
}
