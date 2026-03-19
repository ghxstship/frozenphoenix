import { WorkOrderDetailClient } from "./_client";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <WorkOrderDetailClient id={id} initialRecord={null} />;
}
