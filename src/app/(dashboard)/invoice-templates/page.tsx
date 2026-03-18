"use client";

import { ListPageShell } from "@/components/shells";
import { INVOICE_TEMPLATES_PAGE } from "@/config/list-page-configs";
import {
    useCreateInvoiceTemplate,
    useInvoiceTemplates,
    useUpdateInvoiceTemplate,
} from "@/lib/supabase/hooks-finance";

export default function InvoiceTemplatesPage() {
    const { data: _items } = useInvoiceTemplates();
    const _create = useCreateInvoiceTemplate();
    const _update = useUpdateInvoiceTemplate();
    return <ListPageShell config={INVOICE_TEMPLATES_PAGE} />;
}
