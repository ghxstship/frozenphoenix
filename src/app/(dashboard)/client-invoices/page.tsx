"use client";

import { ListPageShell } from "@/components/shells";
import { useClientInvoices } from "@/lib/supabase";
import {
    useCreateInvoiceLineItem,
    useDeleteInvoiceLineItem,
    useUpdateInvoiceLineItem,
} from "@/lib/supabase/hooks-sow";
import { CLIENT_INVOICES_PAGE } from "@/config/list-page-configs";

export default function ClientInvoicesPage() {
    const { data: rawData, isLoading } = useClientInvoices();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _createLineItem = useCreateInvoiceLineItem();
    const _updateLineItem = useUpdateInvoiceLineItem();
    const _deleteLineItem = useDeleteInvoiceLineItem();

    return <ListPageShell config={CLIENT_INVOICES_PAGE} data={data} isLoading={isLoading} />;
}
