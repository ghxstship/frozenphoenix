import { ApprovalDetailClient } from "./_client";

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ApprovalDetailClient id={id} initialRecord={null} />;
}
