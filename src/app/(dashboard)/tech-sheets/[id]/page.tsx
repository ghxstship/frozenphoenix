import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TechSheetDetailClient } from "./_client";

export default async function TechSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("tech-sheets", id);
    return <TechSheetDetailClient id={id} initialRecord={initialRecord} />;
}
