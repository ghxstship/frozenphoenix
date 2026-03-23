import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CreativeAssetDetailClient } from "./_client";

export default async function CreativeAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("creative-assets", id);
    return <CreativeAssetDetailClient id={id} initialRecord={initialRecord} />;
}
