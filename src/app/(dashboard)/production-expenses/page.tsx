"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_EXPENSES_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionExpense,
    useProductionExpenses,
    useUpdateProductionExpense,
} from "@/lib/supabase/hooks-production";

export default function ProductionExpensesPage() {
    const { data: _items } = useProductionExpenses();
    const _create = useCreateProductionExpense();
    const _update = useUpdateProductionExpense();
    return <ListPageShell config={PRODUCTION_EXPENSES_PAGE} />;
}
