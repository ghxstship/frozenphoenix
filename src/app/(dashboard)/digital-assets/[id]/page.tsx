import { DigitalAssetDetailClient } from "./_client";

export default async function DigitalAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <DigitalAssetDetailClient id={id} initialRecord={null} />;
}
