import { KBArticleDetailClient } from "./_client";

export default async function KBArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <KBArticleDetailClient id={id} initialRecord={null} />;
}
