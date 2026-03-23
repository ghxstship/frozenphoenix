import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PaymentApprovalsDetailClient } from "./_client";

export default async function PaymentApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("payment_approvals", id);
    return <PaymentApprovalsDetailClient id={id} initialRecord={initialRecord} />;
}
