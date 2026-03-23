import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { DigitalAssetDetailClient } from "./_client";

export default async function DigitalAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("digital-assets", id);
    return <DigitalAssetDetailClient id={id} initialRecord={initialRecord} />;
}
