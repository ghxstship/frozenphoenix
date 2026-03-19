import { PaymentsDetailClient } from "./_client";

export default async function PaymentsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PaymentsDetailClient id={id} initialRecord={null} />;
}
