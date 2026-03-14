"use client";

import { ListPageShell } from "@/components/shells";
import { useClientInvoices } from "@/lib/supabase/hooks-pages";
import { CREATE_INVOICE_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "invoices",
    title: "Invoice Management",
    description: "Create, send, and track invoices across all projects",
    icon: AlertTriangle,
    createConfig: CREATE_INVOICE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

export default function InvoicesPage() {
    const { data: rawData, isLoading } = useClientInvoices();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
