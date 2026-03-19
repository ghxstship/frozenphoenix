import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ApprovalWorkflowDetailClient } from "./_client";

export default async function ApprovalWorkflowDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("approval_workflow", id);
    return <ApprovalWorkflowDetailClient id={id} initialRecord={record} />;
}
