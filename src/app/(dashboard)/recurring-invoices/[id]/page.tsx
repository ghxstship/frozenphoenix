import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { RecurringInvoiceDetailClient } from "./_client";

export default async function RecurringInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("recurring-invoices", id);
    return <RecurringInvoiceDetailClient id={id} initialRecord={initialRecord} />;
}
