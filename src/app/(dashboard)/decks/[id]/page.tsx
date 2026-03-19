import { DeckDetailClient } from "./_client";

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DeckDetailClient id={id} initialRecord={null} />;
}
