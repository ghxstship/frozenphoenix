import { ProcurementDetailClient } from "./_client";

export default async function ProcurementDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProcurementDetailClient id={id} />;
}
