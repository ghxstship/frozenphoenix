import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { SavedViewsDetailClient } from "./_client";

export default async function SavedViewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("saved-views", id);
    return <SavedViewsDetailClient id={id} initialRecord={initialRecord} />;
}
