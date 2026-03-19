import { GoodsReceiptsDetailClient } from "./_client";

export default async function GoodsReceiptsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <GoodsReceiptsDetailClient id={id} />;
}
