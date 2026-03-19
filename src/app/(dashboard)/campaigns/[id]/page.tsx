import { CampaignDetailClient } from "./_client";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CampaignDetailClient id={id} initialRecord={null} />;
}
