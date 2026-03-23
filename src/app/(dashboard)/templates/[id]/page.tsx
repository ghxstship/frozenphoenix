import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TemplateDetailClient } from "./_client";

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("templates", id);
    return <TemplateDetailClient id={id} initialRecord={initialRecord} />;
}
