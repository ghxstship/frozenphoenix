import { CrewDetailClient } from "./_client";

export default async function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CrewDetailClient id={id} initialRecord={null} />;
}
