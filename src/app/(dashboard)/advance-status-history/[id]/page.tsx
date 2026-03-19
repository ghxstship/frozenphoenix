import { AdvanceStatusHistoryDetailClient } from "./_client";

export default async function AdvanceStatusHistoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <AdvanceStatusHistoryDetailClient id={id} />;
}
