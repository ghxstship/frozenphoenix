import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { InsurancePolicyDetailClient } from "./_client";

export default async function InsurancePolicyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("insurance_policy", id);
    return <InsurancePolicyDetailClient id={id} initialRecord={record} />;
}
