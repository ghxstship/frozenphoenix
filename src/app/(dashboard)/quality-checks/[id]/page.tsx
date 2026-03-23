import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { QualityChecksDetailClient } from "./_client";

export default async function QualityChecksDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("quality_checks", id);
    return <QualityChecksDetailClient id={id} initialRecord={initialRecord} />;
}
