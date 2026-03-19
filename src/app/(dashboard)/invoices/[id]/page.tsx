import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { InvoiceDetailClient } from "./_client";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("invoice", id);
    return <InvoiceDetailClient id={id} initialRecord={record} />;
}
