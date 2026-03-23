import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ChecklistsDetailClient } from "./_client";

export default async function ChecklistsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("job_checklists", id);
    return <ChecklistsDetailClient id={id} initialRecord={initialRecord} />;
}
