import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { UpsellTriggersDetailClient } from "./_client";

export default async function UpsellTriggersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("upsell_triggers", id);
    return <UpsellTriggersDetailClient id={id} initialRecord={initialRecord} />;
}
