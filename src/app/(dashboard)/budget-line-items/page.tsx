"use client";

import { ListPageShell } from "@/components/shells";
import { BUDGET_LINE_ITEMS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={BUDGET_LINE_ITEMS_PAGE} />;
}
