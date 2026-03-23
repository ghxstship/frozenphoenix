import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { RevenueDetailClient } from "./_client";

export default async function RevenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("revenue_recognition_entries", id);
    return <RevenueDetailClient id={id} initialRecord={initialRecord} />;
}
