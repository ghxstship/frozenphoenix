import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CampaignDetailClient } from "./_client";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("campaigns", id);
    return <CampaignDetailClient id={id} initialRecord={initialRecord} />;
}
