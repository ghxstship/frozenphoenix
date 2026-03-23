import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CallSheetDetailClient } from "./_client";

export default async function CallSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("call-sheets", id);
    return <CallSheetDetailClient id={id} initialRecord={initialRecord} />;
}
