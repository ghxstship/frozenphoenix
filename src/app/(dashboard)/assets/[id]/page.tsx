import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { AssetDetailClient } from "./_client";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("asset", id);
    return <AssetDetailClient id={id} initialRecord={record} />;
}
