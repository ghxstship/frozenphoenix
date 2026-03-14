"use client";

import { ListPageShell } from "@/components/shells";
import { INVENTORY_RESERVATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={INVENTORY_RESERVATIONS_PAGE} />;
}
