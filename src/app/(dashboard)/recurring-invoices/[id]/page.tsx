import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { RecurringInvoiceDetailClient } from "./_client";

export default async function RecurringInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("recurring_invoice", id);
    return <RecurringInvoiceDetailClient id={id} initialRecord={record} />;
}
