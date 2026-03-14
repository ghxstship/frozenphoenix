"use client";

import { ListPageShell } from "@/components/shells";
import { useRecurringInvoices } from "@/lib/supabase/hooks-pages";
import { CREATE_RECURRING_INVOICE_CONFIG } from "@/config/create-entity-configs";
import { Calendar } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "recurring_invoices",
    title: "Recurring Invoices",
    description: "Automate invoice generation on a schedule",
    icon: Calendar,
    createConfig: CREATE_RECURRING_INVOICE_CONFIG,
    searchKeys: ["title", "client"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function RecurringInvoicesPage() {
    const { data: rawData, isLoading } = useRecurringInvoices();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
