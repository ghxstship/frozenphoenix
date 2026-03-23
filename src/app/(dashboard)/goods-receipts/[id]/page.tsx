import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { GoodsReceiptsDetailClient } from "./_client";

export default async function GoodsReceiptsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("goods_receipts", id);
    return <GoodsReceiptsDetailClient id={id} initialRecord={initialRecord} />;
}
