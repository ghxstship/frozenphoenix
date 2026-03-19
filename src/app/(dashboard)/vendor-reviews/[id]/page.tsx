import { VendorReviewDetailClient } from "./_client";

export default async function VendorReviewDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <VendorReviewDetailClient id={id} initialRecord={null} />;
}
