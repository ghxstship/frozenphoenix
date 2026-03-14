"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_BUDGET_LINES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PRODUCTION_BUDGET_LINES_PAGE} />;
}
