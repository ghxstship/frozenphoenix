import { VendorRiskDetailClient } from "./_client";

export default async function VendorRiskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <VendorRiskDetailClient id={id} />;
}
