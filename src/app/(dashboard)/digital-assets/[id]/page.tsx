import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { DigitalAssetDetailClient } from "./_client";

export default async function DigitalAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("digital_asset", id);
    return <DigitalAssetDetailClient id={id} initialRecord={record} />;
}
