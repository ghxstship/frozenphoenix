import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ObligationsDetailClient } from "./_client";

export default async function ObligationsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("contract_obligations", id);
    return <ObligationsDetailClient id={id} initialRecord={initialRecord} />;
}
