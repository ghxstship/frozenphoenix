import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ContractDetailClient } from "./_client";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("contracts", id);
    return <ContractDetailClient id={id} initialRecord={initialRecord} />;
}
