import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { VendorReviewDetailClient } from "./_client";

export default async function VendorReviewDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("vendor_review", id);
    return <VendorReviewDetailClient id={id} initialRecord={record} />;
}
