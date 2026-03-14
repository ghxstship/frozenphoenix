"use client";

import { ListPageShell } from "@/components/shells";
import { EXPENSE_REPORTS_PAGE } from "@/config/list-page-configs";

export default function ExpenseReportsPage() {
    return <ListPageShell config={EXPENSE_REPORTS_PAGE} />;
}
