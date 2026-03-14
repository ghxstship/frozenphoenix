"use client";

import { ListPageShell } from "@/components/shells";
import { CONSUMABLES_PAGE } from "@/config/list-page-configs";

export default function ConsumablesPage() {
    return <ListPageShell config={CONSUMABLES_PAGE} />;
}
