import { ClientInvoiceDetailClient } from "./_client";

export default async function ClientInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ClientInvoiceDetailClient id={id} initialRecord={null} />;
}
