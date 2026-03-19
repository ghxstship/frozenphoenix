import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { GOODS_RECEIPTS_PAGE } from "@/config/list-page-configs";

export default async function GoodsReceiptsPage() {
    const data = await fetchEntityList("goods_receipt");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={GOODS_RECEIPTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
