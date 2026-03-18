"use client";

import { ListPageShell } from "@/components/shells";
import { useClientInvoices } from "@/lib/supabase";
import { INVOICES_PAGE } from "@/config/list-page-configs";
import { useCreateInvoice } from "@/lib/supabase/hooks-finance";

export default function InvoicesPage() {
    const { data: rawData, isLoading } = useClientInvoices();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateInvoice();

    return <ListPageShell config={INVOICES_PAGE} data={data} isLoading={isLoading} />;
}
