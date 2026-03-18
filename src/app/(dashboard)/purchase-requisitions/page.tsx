"use client";

import { ListPageShell } from "@/components/shells";
import { usePurchaseRequisitions } from "@/lib/supabase";
import { PURCHASE_REQUISITIONS_PAGE } from "@/config/list-page-configs";
import { useCreatePurchaseRequisition } from "@/lib/supabase/hooks-legal";

export default function PurchaseRequisitionsPage() {
    const { data: rawData, isLoading } = usePurchaseRequisitions();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreatePurchaseRequisition();

    return <ListPageShell config={PURCHASE_REQUISITIONS_PAGE} data={data} isLoading={isLoading} />;
}
