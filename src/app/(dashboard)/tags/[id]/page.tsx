import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TagsDetailClient } from "./_client";

export default async function TagsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("tags", id);
    return <TagsDetailClient id={id} initialRecord={initialRecord} />;
}
