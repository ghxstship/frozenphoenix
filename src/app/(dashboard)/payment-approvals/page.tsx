"use client";

import { ListPageShell } from "@/components/shells";
import { useBudgetApprovals } from "@/lib/supabase";
import { PAYMENT_APPROVALS_PAGE } from "@/config/list-page-configs";
import {
    useCreatePaymentApproval,
    usePaymentApproval,
    usePaymentApprovals,
    useUpdatePaymentApproval,
} from "@/lib/supabase/hooks-finance";

export default function PaymentApprovalsPage() {
    const { data: rawData, isLoading } = useBudgetApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _paymentApprovals } = usePaymentApprovals();
    const { data: _detail } = usePaymentApproval("");
    const _create = useCreatePaymentApproval();
    const _update = useUpdatePaymentApproval();

    return <ListPageShell config={PAYMENT_APPROVALS_PAGE} data={data} isLoading={isLoading} />;
}
