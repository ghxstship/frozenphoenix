"use client";

import { ListPageShell } from "@/components/shells";
import { usePurchaseOrders } from "@/lib/supabase";
import { PURCHASE_ORDERS_PAGE } from "@/config/list-page-configs";

export default function PurchaseOrdersPage() {
    const { data: rawData, isLoading } = usePurchaseOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PURCHASE_ORDERS_PAGE} data={data} isLoading={isLoading} />;
}
