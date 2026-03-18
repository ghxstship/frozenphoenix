"use client";

import { ListPageShell } from "@/components/shells";
import { useChangeOrders } from "@/lib/supabase";
import { CHANGE_ORDERS_PAGE } from "@/config/list-page-configs";
import { useCreateChangeOrder } from "@/lib/supabase/hooks-legal";

export default function ChangeOrdersPage() {
    const { data: rawData, isLoading } = useChangeOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateChangeOrder();

    return <ListPageShell config={CHANGE_ORDERS_PAGE} data={data} isLoading={isLoading} />;
}
