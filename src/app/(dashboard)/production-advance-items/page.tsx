"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_ADVANCE_ITEMS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PRODUCTION_ADVANCE_ITEMS_PAGE} />;
}
