import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { LostReasonsDetailClient } from "./_client";

export default async function LostReasonsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("lost_reasons", id);
    return <LostReasonsDetailClient id={id} initialRecord={initialRecord} />;
}
