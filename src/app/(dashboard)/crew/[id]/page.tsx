import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CrewDetailClient } from "./_client";

export default async function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("crew", id);
    return <CrewDetailClient id={id} initialRecord={initialRecord} />;
}
