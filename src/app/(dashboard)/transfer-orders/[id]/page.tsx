import { TransferOrdersDetailClient } from "./_client";

export default async function TransferOrdersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <TransferOrdersDetailClient id={id} />;
}
