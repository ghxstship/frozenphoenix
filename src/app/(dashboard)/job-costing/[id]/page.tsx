import { JobCostingDetailClient } from "./_client";

export default async function JobCostingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <JobCostingDetailClient id={id} />;
}
