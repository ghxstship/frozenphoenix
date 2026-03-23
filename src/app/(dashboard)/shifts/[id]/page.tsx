import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ShiftsDetailClient } from "./_client";

export default async function ShiftsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("shifts", id);
    return <ShiftsDetailClient id={id} initialRecord={initialRecord} />;
}
