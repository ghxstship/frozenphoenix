import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ResilienceTargetsDetailClient } from "./_client";

export default async function ResilienceTargetsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("resilience_targets", id);
    return <ResilienceTargetsDetailClient id={id} initialRecord={initialRecord} />;
}
