"use client";

import { ListPageShell } from "@/components/shells";
import { INVENTORY_AUDITS_PAGE } from "@/config/list-page-configs";
import {
    useCreateInventoryAudit,
    useInventoryAudit,
    useInventoryAudits,
    useUpdateInventoryAudit,
} from "@/lib/supabase/hooks-assets-inventory";

export default function InventoryAuditsPage() {
    const { data: _items } = useInventoryAudits();
    const { data: _detail } = useInventoryAudit("");
    const _create = useCreateInventoryAudit();
    const _update = useUpdateInventoryAudit();
    return <ListPageShell config={INVENTORY_AUDITS_PAGE} />;
}
