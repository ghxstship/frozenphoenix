"use client";

import { ListPageShell } from "@/components/shells";
import { useGoodsReceipts } from "@/lib/supabase";
import { GOODS_RECEIPTS_PAGE } from "@/config/list-page-configs";

export default function GoodsReceiptsPage() {
    const { data: rawData, isLoading } = useGoodsReceipts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={GOODS_RECEIPTS_PAGE} data={data} isLoading={isLoading} />;
}
