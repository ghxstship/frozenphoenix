import { WorkforceDetailClient } from "./_client";

export default async function WorkforceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <WorkforceDetailClient id={id} initialRecord={null} />;
}
