import { MaintenanceSchedulesDetailClient } from "./_client";

export default async function MaintenanceSchedulesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <MaintenanceSchedulesDetailClient id={id} />;
}
