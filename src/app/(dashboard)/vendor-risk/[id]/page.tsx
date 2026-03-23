import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { VendorRiskDetailClient } from "./_client";

export default async function VendorRiskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("vendor_risk_scores", id);
    return <VendorRiskDetailClient id={id} initialRecord={initialRecord} />;
}
