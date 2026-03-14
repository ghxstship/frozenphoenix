"use client";

import { ListPageShell } from "@/components/shells";
import { INVENTORY_AUDITS_PAGE } from "@/config/list-page-configs";

export default function InventoryAuditsPage() {
    return <ListPageShell config={INVENTORY_AUDITS_PAGE} />;
}
