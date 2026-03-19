import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ClientInvoiceDetailClient } from "./_client";

export default async function ClientInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("client_invoice", id);
    return <ClientInvoiceDetailClient id={id} initialRecord={record} />;
}
