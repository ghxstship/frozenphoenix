import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { SlaDefinitionsDetailClient } from "./_client";

export default async function SlaDefinitionsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("sla_definitions", id);
    return <SlaDefinitionsDetailClient id={id} initialRecord={initialRecord} />;
}
