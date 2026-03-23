import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CreativeReviewsDetailClient } from "./_client";

export default async function CreativeReviewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("creative_reviews", id);
    return <CreativeReviewsDetailClient id={id} initialRecord={initialRecord} />;
}
