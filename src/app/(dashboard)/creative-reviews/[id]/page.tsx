import { CreativeReviewsDetailClient } from "./_client";

export default async function CreativeReviewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CreativeReviewsDetailClient id={id} />;
}
