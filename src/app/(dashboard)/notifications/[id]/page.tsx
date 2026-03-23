import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { NotificationsDetailClient } from "./_client";

export default async function NotificationsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("notifications", id);
    return <NotificationsDetailClient id={id} initialRecord={initialRecord} />;
}
