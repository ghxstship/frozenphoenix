import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { IntegrationDetailPageClient } from "./_client";

export default async function IntegrationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("integrations", id);
    return <IntegrationDetailPageClient id={id} initialRecord={initialRecord} />;
}
