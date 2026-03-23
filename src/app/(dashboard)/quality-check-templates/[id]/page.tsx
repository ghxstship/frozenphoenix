import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { QualityCheckTemplatesDetailClient } from "./_client";

export default async function QualityCheckTemplatesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("quality_check_templates", id);
    return <QualityCheckTemplatesDetailClient id={id} initialRecord={initialRecord} />;
}
