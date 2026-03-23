import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ProposalDetailPageClient } from "./_client";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("proposals", id);
    return <ProposalDetailPageClient id={id} initialRecord={initialRecord} />;
}
