import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { DispatchDetailClient } from "./_client";

export default async function DispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("dispatch", id);
    return <DispatchDetailClient id={id} initialRecord={initialRecord} />;
}
