import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { OpportunityDetailClient } from "./_client";

export default async function OpportunityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("opportunities", id);
    return <OpportunityDetailClient id={id} initialRecord={initialRecord} />;
}
