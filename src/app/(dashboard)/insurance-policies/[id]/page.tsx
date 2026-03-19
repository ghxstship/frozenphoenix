import { InsurancePolicyDetailClient } from "./_client";

export default async function InsurancePolicyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <InsurancePolicyDetailClient id={id} initialRecord={null} />;
}
