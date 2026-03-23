import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { WorkforceDetailClient } from "./_client";

export default async function WorkforceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("workforce", id);
    return <WorkforceDetailClient id={id} initialRecord={initialRecord} />;
}
