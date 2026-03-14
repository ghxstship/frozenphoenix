"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_EXPENSES_PAGE } from "@/config/list-page-configs";

export default function ProductionExpensesPage() {
    return <ListPageShell config={PRODUCTION_EXPENSES_PAGE} />;
}
