import { PaymentApprovalsDetailClient } from "./_client";

export default async function PaymentApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PaymentApprovalsDetailClient id={id} />;
}
