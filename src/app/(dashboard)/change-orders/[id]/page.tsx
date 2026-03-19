import { ChangeOrderDetailClient } from "./_client";

export default async function ChangeOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ChangeOrderDetailClient id={id} initialRecord={null} />;
}
