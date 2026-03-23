import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { AssetDetailClient } from "./_client";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("assets", id);
    return <AssetDetailClient id={id} initialRecord={initialRecord} />;
}
