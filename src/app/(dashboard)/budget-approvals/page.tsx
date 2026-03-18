"use client";

import { ListPageShell } from "@/components/shells";
import { useBudgetApprovals } from "@/lib/supabase";
import { BUDGET_APPROVALS_PAGE } from "@/config/list-page-configs";
import { useCreateBudgetApproval, useUpdateBudgetApproval } from "@/lib/supabase/hooks-finance";

export default function BudgetApprovalsPage() {
    const { data: rawData, isLoading } = useBudgetApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateBudgetApproval();
    const _update = useUpdateBudgetApproval();

    return <ListPageShell config={BUDGET_APPROVALS_PAGE} data={data} isLoading={isLoading} />;
}
