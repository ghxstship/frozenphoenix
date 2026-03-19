import { SavedViewsDetailClient } from "./_client";

export default async function SavedViewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <SavedViewsDetailClient id={id} initialRecord={null} />;
}
