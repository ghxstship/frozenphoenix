"use client";

import { ListPageShell } from "@/components/shells";
import { useInventoryItems } from "@/lib/supabase";
import { INVENTORY_PAGE } from "@/config/list-page-configs";

export default function InventoryPage() {
    const { data: rawData, isLoading } = useInventoryItems();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={INVENTORY_PAGE} data={data} isLoading={isLoading} />;
}
