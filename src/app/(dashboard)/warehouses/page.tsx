"use client";

import { ListPageShell } from "@/components/shells";
import { useWarehouses } from "@/lib/supabase";
import { WAREHOUSES_PAGE } from "@/config/list-page-configs";

export default function WarehousesPage() {
    const { data: rawData, isLoading } = useWarehouses();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={WAREHOUSES_PAGE} data={data} isLoading={isLoading} />;
}
