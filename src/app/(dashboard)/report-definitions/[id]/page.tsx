import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ReportDefinitionsDetailClient } from "./_client";

export default async function ReportDefinitionsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("report_definitions", id);
    return <ReportDefinitionsDetailClient id={id} initialRecord={initialRecord} />;
}
