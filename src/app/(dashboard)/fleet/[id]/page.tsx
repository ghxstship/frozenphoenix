import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { FleetDetailClient } from "./_client";

export default async function FleetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("fleet", id);
    return <FleetDetailClient id={id} initialRecord={initialRecord} />;
}
