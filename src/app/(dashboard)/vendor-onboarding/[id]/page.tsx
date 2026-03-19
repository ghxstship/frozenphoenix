import { VendorOnboardingDetailClient } from "./_client";

export default async function VendorOnboardingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <VendorOnboardingDetailClient id={id} />;
}
