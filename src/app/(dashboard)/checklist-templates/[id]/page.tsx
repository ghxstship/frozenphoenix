import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ChecklistTemplatesDetailClient } from "./_client";

export default async function ChecklistTemplatesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("checklist_templates", id);
    return <ChecklistTemplatesDetailClient id={id} initialRecord={initialRecord} />;
}
