"use client";

import { ListPageShell } from "@/components/shells";
import { useBudgetApprovals } from "@/lib/supabase";
import { PAYMENT_APPROVALS_PAGE } from "@/config/list-page-configs";

export default function PaymentApprovalsPage() {
    const { data: rawData, isLoading } = useBudgetApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PAYMENT_APPROVALS_PAGE} data={data} isLoading={isLoading} />;
}
