import { TimeOffDetailClient } from "./_client";

export default async function TimeOffDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TimeOffDetailClient id={id} />;
}
