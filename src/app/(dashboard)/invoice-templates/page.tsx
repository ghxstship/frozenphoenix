"use client";

import { ListPageShell } from "@/components/shells";
import { INVOICE_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function InvoiceTemplatesPage() {
    return <ListPageShell config={INVOICE_TEMPLATES_PAGE} />;
}
