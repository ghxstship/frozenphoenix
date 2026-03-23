import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PipelineDetailClient } from "./_client";

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("pipelines", id);
    return <PipelineDetailClient id={id} initialRecord={initialRecord} />;
}
