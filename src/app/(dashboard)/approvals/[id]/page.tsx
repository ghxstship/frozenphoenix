import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ApprovalDetailClient } from "./_client";

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("approvals", id);
    return <ApprovalDetailClient id={id} initialRecord={initialRecord} />;
}
