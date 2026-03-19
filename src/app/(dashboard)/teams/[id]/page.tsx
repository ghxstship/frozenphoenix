import { TeamsDetailClient } from "./_client";

export default async function TeamsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TeamsDetailClient id={id} />;
}
