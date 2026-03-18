"use client";

import { ListPageShell } from "@/components/shells";
import { useWarehouses } from "@/lib/supabase";
import { WAREHOUSES_PAGE } from "@/config/list-page-configs";
import {
    useCreateWarehouse,
    useDeleteWarehouse,
    useUpdateWarehouse,
} from "@/lib/supabase/hooks-assets-inventory";

export default function WarehousesPage() {
    const { data: rawData, isLoading } = useWarehouses();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateWarehouse();
    const _update = useUpdateWarehouse();
    const _delete = useDeleteWarehouse();

    return <ListPageShell config={WAREHOUSES_PAGE} data={data} isLoading={isLoading} />;
}
