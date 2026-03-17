"use client";

import { ListPageShell } from "@/components/shells";
import { useRecurringInvoices } from "@/lib/supabase";
import { RECURRING_INVOICES_PAGE } from "@/config/list-page-configs";

export default function RecurringInvoicesPage() {
    const { data: rawData, isLoading } = useRecurringInvoices();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={RECURRING_INVOICES_PAGE} data={data} isLoading={isLoading} />;
}
