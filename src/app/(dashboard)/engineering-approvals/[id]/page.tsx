import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { EngineeringApprovalsDetailClient } from "./_client";

export default async function EngineeringApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("engineering_approvals", id);
    return <EngineeringApprovalsDetailClient id={id} initialRecord={initialRecord} />;
}
