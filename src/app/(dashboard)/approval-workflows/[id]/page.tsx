import { ApprovalWorkflowDetailClient } from "./_client";

export default async function ApprovalWorkflowDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ApprovalWorkflowDetailClient id={id} initialRecord={null} />;
}
