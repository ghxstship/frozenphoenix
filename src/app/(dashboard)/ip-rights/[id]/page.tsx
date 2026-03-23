import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { IpRightsDetailClient } from "./_client";

export default async function IpRightsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("ip-rights", id);
    return <IpRightsDetailClient id={id} initialRecord={initialRecord} />;
}
