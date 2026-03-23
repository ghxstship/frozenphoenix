import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { VendorDetailClient } from "./_client";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("vendors", id);
    return <VendorDetailClient id={id} initialRecord={initialRecord} />;
}
