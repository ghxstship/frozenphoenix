"use client";

import { ListPageShell } from "@/components/shells";
import { usePayments } from "@/lib/supabase";
import { PAYMENTS_PAGE } from "@/config/list-page-configs";
import { useCreatePayment, useDeletePayment, useUpdatePayment } from "@/lib/supabase/hooks-finance";

export default function PaymentsPage() {
    const { data: rawData, isLoading } = usePayments();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreatePayment();
    const _update = useUpdatePayment();
    const _delete = useDeletePayment();

    return <ListPageShell config={PAYMENTS_PAGE} data={data} isLoading={isLoading} />;
}
