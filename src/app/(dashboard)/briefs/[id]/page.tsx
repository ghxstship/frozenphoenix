import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BriefDetailClient } from "./_client";

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("briefs", id);
    return <BriefDetailClient id={id} initialRecord={initialRecord} />;
}
