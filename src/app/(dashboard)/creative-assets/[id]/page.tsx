import { CreativeAssetDetailClient } from "./_client";

export default async function CreativeAssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CreativeAssetDetailClient id={id} initialRecord={null} />;
}
