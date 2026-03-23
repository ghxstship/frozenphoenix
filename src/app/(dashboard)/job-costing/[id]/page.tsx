import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { JobCostingDetailClient } from "./_client";

export default async function JobCostingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("job_cost_entries", id);
    return <JobCostingDetailClient id={id} initialRecord={initialRecord} />;
}
