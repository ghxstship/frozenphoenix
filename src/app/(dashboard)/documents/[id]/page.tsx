import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { DocumentDetailClient } from "./_client";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("documents", id);
    return <DocumentDetailClient id={id} initialRecord={initialRecord} />;
}
