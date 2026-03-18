"use client";

import { ListPageShell } from "@/components/shells";
import { useInventoryItems } from "@/lib/supabase";
import { INVENTORY_PAGE } from "@/config/list-page-configs";
import { useCreateInventoryItem } from "@/lib/supabase/hooks-assets-inventory";

export default function InventoryPage() {
    const { data: rawData, isLoading } = useInventoryItems();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateInventoryItem();

    return <ListPageShell config={INVENTORY_PAGE} data={data} isLoading={isLoading} />;
}
