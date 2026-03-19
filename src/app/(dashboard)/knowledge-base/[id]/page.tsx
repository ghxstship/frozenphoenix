import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { KBArticleDetailClient } from "./_client";

export default async function KBArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("kb_article", id);
    return <KBArticleDetailClient id={id} initialRecord={record} />;
}
