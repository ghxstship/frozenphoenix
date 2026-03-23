import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { VendorOnboardingDetailClient } from "./_client";

export default async function VendorOnboardingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("vendors", id);
    return <VendorOnboardingDetailClient id={id} initialRecord={initialRecord} />;
}
