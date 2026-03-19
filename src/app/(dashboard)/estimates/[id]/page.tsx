import { EstimateDetailClient } from "./_client";

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EstimateDetailClient id={id} initialRecord={null} />;
}
