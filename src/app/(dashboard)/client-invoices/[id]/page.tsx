import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ClientInvoiceDetailClient } from "./_client";

export default async function ClientInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("client-invoices", id);
    return <ClientInvoiceDetailClient id={id} initialRecord={initialRecord} />;
}
