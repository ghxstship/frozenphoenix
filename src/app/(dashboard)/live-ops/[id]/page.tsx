import { LiveOpsDetailClient } from "./_client";

export default async function LiveOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <LiveOpsDetailClient id={id} initialRecord={null} />;
}
