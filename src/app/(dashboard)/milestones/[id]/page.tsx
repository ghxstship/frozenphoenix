import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { MilestonesDetailClient } from "./_client";

export default async function MilestonesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("milestones", id);
    return <MilestonesDetailClient id={id} initialRecord={initialRecord} />;
}
