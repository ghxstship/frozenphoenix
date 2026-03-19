import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CreativeAssetDetailClient } from "./_client";

export default async function CreativeAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("creative_asset", id);
    return <CreativeAssetDetailClient id={id} initialRecord={record} />;
}
