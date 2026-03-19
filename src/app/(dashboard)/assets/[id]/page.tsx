import { AssetDetailClient } from "./_client";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AssetDetailClient id={id} initialRecord={null} />;
}
