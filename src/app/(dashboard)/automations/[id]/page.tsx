import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { AutomationDetailPageClient } from "./_client";

export default async function AutomationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("automations", id);
    return <AutomationDetailPageClient id={id} initialRecord={initialRecord} />;
}
