import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { WorkOrderDetailClient } from "./_client";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("work_order", id);
    return <WorkOrderDetailClient id={id} initialRecord={record} />;
}
