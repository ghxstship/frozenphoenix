import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { UpsellEventsDetailClient } from "./_client";

export default async function UpsellEventsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("upsell_events", id);
    return <UpsellEventsDetailClient id={id} initialRecord={initialRecord} />;
}
