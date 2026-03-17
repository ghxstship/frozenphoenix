"use client";

import { useParams } from "next/navigation";
import { useClientInvoice, useDeleteClientInvoice, useUpdateClientInvoice } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { FileText } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "client_invoices",
    titleKey: "invoice_number",
    statusKey: "status",
    icon: FileText,
    backHref: "/client-invoices",
    backLabel: "Client Invoices",
    chatterRecordType: "client_invoice",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "total_amount", label: "Amount", accessorKey: "total_amount", fieldType: "currency" },
        { id: "due_date", label: "Due Date", accessorKey: "due_date", fieldType: "date" },
        { id: "issued_date", label: "Issued", accessorKey: "issued_date", fieldType: "date" },
    ],
    fields: [
        {
            id: "total_amount",
            label: "Total Amount",
            accessorKey: "total_amount",
            fieldType: "currency",
        },
        {
            id: "paid_amount",
            label: "Paid Amount",
            accessorKey: "paid_amount",
            fieldType: "currency",
        },
        { id: "due_date", label: "Due Date", accessorKey: "due_date", fieldType: "date" },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [
        {
            id: "line-items",
            label: "Line Items",
            content: (
                <EmptyState
                    icon={FileText}
                    title="No line items"
                    description="Invoice line items and charges will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function ClientInvoiceDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: invoice, isLoading } = useClientInvoice(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Client Invoice",
        listPath: "/client-invoices",
        useUpdateHook: useUpdateClientInvoice,
        useDeleteHook: useDeleteClientInvoice,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={invoice as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
