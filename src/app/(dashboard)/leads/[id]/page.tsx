import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { LeadDetailClient } from "./_client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("leads", id);
    return <LeadDetailClient id={id} initialRecord={initialRecord} />;
}
