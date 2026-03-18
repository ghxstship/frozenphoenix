"use client";

import { ListPageShell } from "@/components/shells";
import { BUDGET_LINE_ITEMS_PAGE } from "@/config/list-page-configs";
import {
    useCreateBudgetLineItem,
    useDeleteBudgetLineItem,
    useUpdateBudgetLineItem,
} from "@/lib/supabase/hooks-finance";

export default function Page() {
    const _create = useCreateBudgetLineItem();
    const _update = useUpdateBudgetLineItem();
    const _delete = useDeleteBudgetLineItem();
    return <ListPageShell config={BUDGET_LINE_ITEMS_PAGE} />;
}
