import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CampaignDetailClient } from "./_client";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("campaign", id);
    return <CampaignDetailClient id={id} initialRecord={record} />;
}
