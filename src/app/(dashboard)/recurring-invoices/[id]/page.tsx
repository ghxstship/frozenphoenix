import { RecurringInvoiceDetailClient } from "./_client";

export default async function RecurringInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <RecurringInvoiceDetailClient id={id} initialRecord={null} />;
}
