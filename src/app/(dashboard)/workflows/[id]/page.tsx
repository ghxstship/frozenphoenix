import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { WorkflowsDetailClient } from "./_client";

export default async function WorkflowsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("workflow_instances", id);
    return <WorkflowsDetailClient id={id} initialRecord={initialRecord} />;
}
