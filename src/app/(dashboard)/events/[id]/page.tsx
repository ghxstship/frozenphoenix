import { EventDetailClient } from "./_client";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EventDetailClient id={id} initialRecord={null} />;
}
