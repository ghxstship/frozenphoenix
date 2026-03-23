import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { InvoiceDetailClient } from "./_client";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("invoices", id);
    return <InvoiceDetailClient id={id} initialRecord={initialRecord} />;
}
