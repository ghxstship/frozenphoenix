"use client";

import { ListPageShell } from "@/components/shells";
import { useWorkOrders } from "@/lib/supabase";
import { WORK_ORDERS_PAGE } from "@/config/list-page-configs";
import { useCreateDispatchRecord, useCreateWorkOrder } from "@/lib/supabase/hooks-admin";

export default function WorkOrdersPage() {
    const { data: rawData, isLoading } = useWorkOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateWorkOrder();
    const _createDispatch = useCreateDispatchRecord();

    return <ListPageShell config={WORK_ORDERS_PAGE} data={data} isLoading={isLoading} />;
}
