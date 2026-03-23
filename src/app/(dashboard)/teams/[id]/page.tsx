import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TeamsDetailClient } from "./_client";

export default async function TeamsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("teams", id);
    return <TeamsDetailClient id={id} initialRecord={initialRecord} />;
}
