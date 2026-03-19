import { IpRightsDetailClient } from "./_client";

export default async function IpRightsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <IpRightsDetailClient id={id} initialRecord={null} />;
}
