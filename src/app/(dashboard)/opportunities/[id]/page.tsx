import { OpportunityDetailClient } from "./_client";

export default async function OpportunityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <OpportunityDetailClient id={id} initialRecord={null} />;
}
