import { TagsDetailClient } from "./_client";

export default async function TagsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TagsDetailClient id={id} initialRecord={null} />;
}
