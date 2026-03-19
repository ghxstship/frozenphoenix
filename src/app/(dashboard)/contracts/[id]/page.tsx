import { ContractDetailClient } from "./_client";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ContractDetailClient id={id} initialRecord={null} />;
}
