import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ApprovalDetailClient } from "./_client";

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("approval", id);
    return <ApprovalDetailClient id={id} initialRecord={record} />;
}
