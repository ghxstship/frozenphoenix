import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { VendorReviewDetailClient } from "./_client";

export default async function VendorReviewDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("vendor-reviews", id);
    return <VendorReviewDetailClient id={id} initialRecord={initialRecord} />;
}
