"use client";

import { ListPageShell } from "@/components/shells";
import { CREDENTIAL_INVENTORY_POOLS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CREDENTIAL_INVENTORY_POOLS_PAGE} />;
}
