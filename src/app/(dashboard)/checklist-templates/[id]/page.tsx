import { ChecklistTemplatesDetailClient } from "./_client";

export default async function ChecklistTemplatesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ChecklistTemplatesDetailClient id={id} />;
}
