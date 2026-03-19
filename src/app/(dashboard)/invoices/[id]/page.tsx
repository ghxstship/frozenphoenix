import { InvoiceDetailClient } from "./_client";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <InvoiceDetailClient id={id} initialRecord={null} />;
}
