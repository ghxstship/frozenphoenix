import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { DeckDetailClient } from "./_client";

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("decks", id);
    return <DeckDetailClient id={id} initialRecord={initialRecord} />;
}
