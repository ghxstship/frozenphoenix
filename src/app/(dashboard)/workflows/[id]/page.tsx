import { WorkflowsDetailClient } from "./_client";

export default async function WorkflowsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <WorkflowsDetailClient id={id} />;
}
