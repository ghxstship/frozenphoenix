"use client";

import { ListPageShell } from "@/components/shells";
import { EXPENSE_REPORTS_PAGE } from "@/config/list-page-configs";
import { useCreateExpenseReport, useExpenseReports } from "@/lib/supabase/hooks-finance";

export default function ExpenseReportsPage() {
    const { data: _items } = useExpenseReports();
    const _create = useCreateExpenseReport();
    return <ListPageShell config={EXPENSE_REPORTS_PAGE} />;
}
