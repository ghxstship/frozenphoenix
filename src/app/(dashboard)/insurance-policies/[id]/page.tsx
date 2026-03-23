import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { InsurancePolicyDetailClient } from "./_client";

export default async function InsurancePolicyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("insurance-policies", id);
    return <InsurancePolicyDetailClient id={id} initialRecord={initialRecord} />;
}
