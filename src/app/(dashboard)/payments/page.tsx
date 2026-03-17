"use client";

import { ListPageShell } from "@/components/shells";
import { usePayments } from "@/lib/supabase";
import { PAYMENTS_PAGE } from "@/config/list-page-configs";

export default function PaymentsPage() {
    const { data: rawData, isLoading } = usePayments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PAYMENTS_PAGE} data={data} isLoading={isLoading} />;
}
