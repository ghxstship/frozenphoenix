import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ContractDetailClient } from "./_client";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("contract", id);
    return <ContractDetailClient id={id} initialRecord={record} />;
}
