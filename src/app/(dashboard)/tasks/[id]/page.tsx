import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TaskDetailPageClient } from "./_client";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("tasks", id);
    return <TaskDetailPageClient id={id} initialRecord={initialRecord} />;
}
