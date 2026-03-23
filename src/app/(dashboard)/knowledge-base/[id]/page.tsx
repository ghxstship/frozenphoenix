import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { KBArticleDetailClient } from "./_client";

export default async function KBArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("knowledge-base", id);
    return <KBArticleDetailClient id={id} initialRecord={initialRecord} />;
}
