import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { DeckDetailClient } from "./_client";

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("deck", id);
    return <DeckDetailClient id={id} initialRecord={record} />;
}
