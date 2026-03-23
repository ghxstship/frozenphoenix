import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ApprovalWorkflowDetailClient } from "./_client";

export default async function ApprovalWorkflowDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("approval-workflows", id);
    return <ApprovalWorkflowDetailClient id={id} initialRecord={initialRecord} />;
}
