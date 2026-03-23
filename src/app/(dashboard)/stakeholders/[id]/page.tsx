import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { StakeholdersDetailClient } from "./_client";

export default async function StakeholdersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("stakeholders", id);
    return <StakeholdersDetailClient id={id} initialRecord={initialRecord} />;
}
