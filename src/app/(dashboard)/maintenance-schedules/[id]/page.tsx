import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { MaintenanceSchedulesDetailClient } from "./_client";

export default async function MaintenanceSchedulesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("maintenance_schedules", id);
    return <MaintenanceSchedulesDetailClient id={id} initialRecord={initialRecord} />;
}
