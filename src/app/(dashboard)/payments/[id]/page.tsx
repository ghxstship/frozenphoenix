import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PaymentsDetailClient } from "./_client";

export default async function PaymentsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("payments", id);
    return <PaymentsDetailClient id={id} initialRecord={initialRecord} />;
}
