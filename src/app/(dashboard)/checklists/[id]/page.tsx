import { ChecklistsDetailClient } from "./_client";

export default async function ChecklistsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ChecklistsDetailClient id={id} />;
}
