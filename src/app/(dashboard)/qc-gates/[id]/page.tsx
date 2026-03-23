import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { QcGatesDetailClient } from "./_client";

export default async function QcGatesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("qc-gates", id);
    return <QcGatesDetailClient id={id} initialRecord={initialRecord} />;
}
